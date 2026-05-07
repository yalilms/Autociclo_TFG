package com.autociclo.utils;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.CookieManager;
import java.net.CookiePolicy;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * Cliente JSON-RPC para Odoo 17 Community.
 * Se inyecta en los servicios que necesiten crear pedidos o facturas.
 *
 * Flujo al aprobar una solicitud:
 *   1. authenticate()      → obtiene uid
 *   2. buscarOCrearPartner → res.partner (cliente)
 *   3. crearPedidoVenta    → sale.order con líneas de la solicitud
 *   4. confirmarPedido     → pasa a estado 'sale'
 *   5. retornar referencia del pedido
 *
 * @author Yalil Musa Talhaoui
 */
@Component
public class OdooClient {

    @Value("${odoo.url:http://localhost:8069}")
    private String odooUrl;

    @Value("${odoo.db:odoo17}")
    private String odooDb;

    @Value("${odoo.user:admin}")
    private String odooUser;

    @Value("${odoo.password:admin}")
    private String odooPassword;

    private final HttpClient httpClient;
    private final ObjectMapper mapper;

    public OdooClient() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .cookieHandler(new CookieManager(null, CookiePolicy.ACCEPT_ALL))
                .build();
        this.mapper = new ObjectMapper();
    }

    // ─────────────────────────────────────────────────────────
    //  API pública
    // ─────────────────────────────────────────────────────────

    /**
     * Crea un pedido de venta en Odoo a partir de una solicitud aprobada.
     *
     * @param nombreCliente  Nombre del cliente (se busca o crea en res.partner)
     * @param emailCliente   Email del cliente
     * @param lineas         Lista de mapas con keys: nombre, cantidad, precioUnitario
     * @return referencia del pedido (ej: "S00042") o null si Odoo no está disponible
     */
    public String crearPedidoVenta(String nombreCliente, String emailCliente,
                                   List<Map<String, Object>> lineas) {
        try {
            int uid = authenticate();
            if (uid <= 0) return null;

            int partnerId = buscarOCrearPartner(uid, nombreCliente, emailCliente);
            int orderId   = crearSaleOrder(uid, partnerId, lineas);
            confirmarPedido(uid, orderId);

            return obtenerReferenciaPedido(uid, orderId);
        } catch (Exception e) {
            // Odoo puede no estar disponible en desarrollo — fallamos silenciosamente
            System.err.println("[OdooClient] Error al crear pedido: " + e.getMessage());
            return null;
        }
    }

    // ─────────────────────────────────────────────────────────
    //  Métodos privados JSON-RPC
    // ─────────────────────────────────────────────────────────

    private int authenticate() throws Exception {
        ObjectNode params = mapper.createObjectNode();
        params.put("db",       odooDb);
        params.put("login",    odooUser);
        params.put("password", odooPassword);

        JsonNode result = callJsonRpc("/web/session/authenticate", params);
        return result.has("uid") && !result.get("uid").isNull()
                ? result.get("uid").asInt() : 0;
    }

    private int buscarOCrearPartner(int uid, String nombre, String email) throws Exception {
        // Buscar partner por email
        ArrayNode domain = mapper.createArrayNode();
        ArrayNode cond   = mapper.createArrayNode();
        cond.add("email"); cond.add("="); cond.add(email);
        domain.add(cond);

        JsonNode ids = callOdooRpc(uid, "res.partner", "search", domain);
        if (ids.isArray() && ids.size() > 0) {
            return ids.get(0).asInt();
        }

        // Crear nuevo partner
        ObjectNode vals = mapper.createObjectNode();
        vals.put("name",  nombre);
        vals.put("email", email);
        vals.put("customer_rank", 1);
        JsonNode newId = callOdooRpc(uid, "res.partner", "create", vals);
        return newId.asInt();
    }

    private int buscarOCrearProducto(int uid, String nombre, double precio) throws Exception {
        ArrayNode domain = mapper.createArrayNode();
        ArrayNode cond   = mapper.createArrayNode();
        cond.add("name"); cond.add("="); cond.add(nombre);
        domain.add(cond);

        JsonNode ids = callOdooRpc(uid, "product.product", "search", domain);
        if (ids.isArray() && ids.size() > 0) {
            int existingId = ids.get(0).asInt();
            // Actualizar precio de lista para que coincida con el precio de la pieza
            ArrayNode writeIds = mapper.createArrayNode();
            writeIds.add(existingId);
            ObjectNode writeArgs = mapper.createObjectNode();
            writeArgs.set("ids", writeIds);
            ObjectNode writeVals = mapper.createObjectNode();
            writeVals.put("list_price", precio);
            ArrayNode writeArgsArr = mapper.createArrayNode();
            writeArgsArr.add(writeIds);
            writeArgsArr.add(writeVals);
            callOdooRpc(uid, "product.product", "write", writeArgsArr);
            return existingId;
        }

        ObjectNode vals = mapper.createObjectNode();
        vals.put("name",       nombre);
        vals.put("type",       "consu");
        vals.put("sale_ok",    true);
        vals.put("purchase_ok",false);
        vals.put("list_price", precio);
        JsonNode newId = callOdooRpc(uid, "product.product", "create", vals);
        return newId.asInt();
    }

    private int crearSaleOrder(int uid, int partnerId,
                               List<Map<String, Object>> lineas) throws Exception {
        // ID del impuesto IVA 21% en Odoo
        ArrayNode taxDomain = mapper.createArrayNode();
        ArrayNode taxCond   = mapper.createArrayNode();
        taxCond.add("name"); taxCond.add("="); taxCond.add("IVA 21%");
        taxDomain.add(taxCond);
        JsonNode taxIds = callOdooRpc(uid, "account.tax", "search", taxDomain);
        int ivaId = (taxIds.isArray() && taxIds.size() > 0) ? taxIds.get(0).asInt() : -1;

        ArrayNode orderLines = mapper.createArrayNode();
        for (Map<String, Object> linea : lineas) {
            double precio = Double.parseDouble(linea.get("precioUnitario").toString());
            int productId = buscarOCrearProducto(uid, linea.get("nombre").toString(), precio);
            ArrayNode cmd  = mapper.createArrayNode();
            ObjectNode val = mapper.createObjectNode();
            val.put("product_id",      productId);
            val.put("name",            linea.get("nombre").toString());
            val.put("product_uom_qty", Double.parseDouble(linea.get("cantidad").toString()));
            val.put("price_unit",      precio);
            if (ivaId > 0) {
                ArrayNode taxes = mapper.createArrayNode();
                taxes.add(ivaId);
                val.set("tax_id", taxes);
            }
            cmd.add(0); cmd.add(0); cmd.add(val);
            orderLines.add(cmd);
        }

        ObjectNode vals = mapper.createObjectNode();
        vals.put("partner_id", partnerId);
        vals.set("order_line", orderLines);

        JsonNode result = callOdooRpc(uid, "sale.order", "create", vals);
        return result.asInt();
    }

    private void confirmarPedido(int uid, int orderId) throws Exception {
        ArrayNode ids = mapper.createArrayNode();
        ids.add(orderId);
        callOdooRpc(uid, "sale.order", "action_confirm", ids);
    }

    private String obtenerReferenciaPedido(int uid, int orderId) throws Exception {
        ArrayNode ids  = mapper.createArrayNode();
        ids.add(orderId);
        ArrayNode fields = mapper.createArrayNode();
        fields.add("name");

        ObjectNode kwargs = mapper.createObjectNode();
        kwargs.set("fields", fields);

        JsonNode result = callOdooRpc(uid, "sale.order", "read", ids, kwargs);
        if (result.isArray() && result.size() > 0) {
            return result.get(0).get("name").asText();
        }
        return "S" + orderId;
    }

    // ─────────────────────────────────────────────────────────
    //  Helpers JSON-RPC
    // ─────────────────────────────────────────────────────────

    /** Llama a /web/dataset/call_kw (modelo/método/args) */
    private JsonNode callOdooRpc(int uid, String model, String method,
                                 JsonNode args) throws Exception {
        return callOdooRpc(uid, model, method, args, mapper.createObjectNode());
    }

    private JsonNode callOdooRpc(int uid, String model, String method,
                                 JsonNode args, JsonNode kwargs) throws Exception {
        ObjectNode params = mapper.createObjectNode();
        params.put("model",  model);
        params.put("method", method);

        ArrayNode argsArray = mapper.createArrayNode();
        argsArray.add(args);
        params.set("args",   argsArray);
        params.set("kwargs", kwargs);

        return callJsonRpc("/web/dataset/call_kw", params);
    }

    /** Realiza una llamada JSON-RPC genérica al endpoint dado */
    private JsonNode callJsonRpc(String endpoint, ObjectNode params) throws Exception {
        ObjectNode payload = mapper.createObjectNode();
        payload.put("jsonrpc", "2.0");
        payload.put("method",  "call");
        payload.put("id",      1);
        payload.set("params",  params);

        String body = mapper.writeValueAsString(payload);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(odooUrl + endpoint))
                .timeout(Duration.ofSeconds(15))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        HttpResponse<String> response = httpClient.send(request,
                HttpResponse.BodyHandlers.ofString());

        JsonNode root = mapper.readTree(response.body());
        if (root.has("error")) {
            throw new RuntimeException("Error Odoo: " + root.get("error").toPrettyString());
        }
        return root.get("result");
    }
}
