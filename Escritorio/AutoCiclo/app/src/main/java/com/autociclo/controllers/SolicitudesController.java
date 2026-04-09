package com.autociclo.controllers;

import com.autociclo.api.ApiClient;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import javafx.application.Platform;
import javafx.beans.property.SimpleStringProperty;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.*;

import java.net.URL;
import java.util.ResourceBundle;

/**
 * Controlador de Solicitudes de Presupuesto.
 * Permite aprobar y rechazar solicitudes via API.
 * Al aprobar, la API lanza el flujo Odoo (pedido de venta + factura).
 *
 * @author Yalil Musa Talhaoui
 */
public class SolicitudesController implements Initializable {

    @FXML private TableView<JsonObject>          tableSolicitudes;
    @FXML private TableColumn<JsonObject, String> colSolId;
    @FXML private TableColumn<JsonObject, String> colSolCliente;
    @FXML private TableColumn<JsonObject, String> colSolEstado;
    @FXML private TableColumn<JsonObject, String> colSolFecha;
    @FXML private TableColumn<JsonObject, String> colSolPrecio;
    @FXML private TableColumn<JsonObject, String> colSolRespuesta;
    @FXML private TextField txtFiltroEstado;
    @FXML private Label lblStatusSolicitudes;
    @FXML private Label lblOdooRef;

    private final ObservableList<JsonObject> listaSolicitudes = FXCollections.observableArrayList();
    private final ObservableList<JsonObject> listaFiltrada    = FXCollections.observableArrayList();

    @Override
    public void initialize(URL url, ResourceBundle rb) {
        configurarColumnas();
        tableSolicitudes.setItems(listaFiltrada);
        cargarSolicitudes();
    }

    private void configurarColumnas() {
        colSolId.setCellValueFactory(d ->
                new SimpleStringProperty(getStr(d.getValue(), "idSolicitud")));
        colSolCliente.setCellValueFactory(d ->
                new SimpleStringProperty(getNombreCliente(d.getValue())));
        colSolEstado.setCellValueFactory(d ->
                new SimpleStringProperty(formatEstado(getStr(d.getValue(), "estado"))));
        colSolFecha.setCellValueFactory(d ->
                new SimpleStringProperty(getStr(d.getValue(), "fechaSolicitud")));
        colSolPrecio.setCellValueFactory(d ->
                new SimpleStringProperty(getStr(d.getValue(), "precioTotal")));
        colSolRespuesta.setCellValueFactory(d ->
                new SimpleStringProperty(getStr(d.getValue(), "respuestaAdmin")));
    }

    @FXML
    public void cargarSolicitudes() {
        setStatus("Cargando solicitudes…");
        lblOdooRef.setText("");
        new Thread(() -> {
            ApiClient.ApiResponse resp = ApiClient.getInstance().get("/api/solicitudes");
            Platform.runLater(() -> {
                if (resp.isSuccess()) {
                    listaSolicitudes.clear();
                    JsonArray arr = JsonParser.parseString(resp.getBody()).getAsJsonArray();
                    arr.forEach(e -> listaSolicitudes.add(e.getAsJsonObject()));
                    listaFiltrada.setAll(listaSolicitudes);
                    setStatus(listaSolicitudes.size() + " solicitudes cargadas.");
                } else {
                    setStatus("Error al cargar (código " + resp.getStatusCode() + ").");
                }
            });
        }).start();
    }

    @FXML
    private void aprobarSolicitud() {
        JsonObject sel = tableSolicitudes.getSelectionModel().getSelectedItem();
        if (sel == null) { mostrarAviso("Selecciona una solicitud."); return; }

        String estado = getStr(sel, "estado");
        if (!"pendiente".equals(estado) && !"en_revision".equals(estado)) {
            mostrarAviso("Solo se pueden aprobar solicitudes en estado pendiente o en revisión.");
            return;
        }

        // Pedir precio total y respuesta al admin
        Dialog<ButtonType> dialog = new Dialog<>();
        dialog.setTitle("Aprobar solicitud #" + getStr(sel, "idSolicitud"));
        dialog.setHeaderText("Cliente: " + getNombreCliente(sel));

        TextField fPrecio    = new TextField(); fPrecio.setPromptText("Precio total (ej: 250.00)");
        TextArea  fRespuesta = new TextArea();  fRespuesta.setPromptText("Respuesta para el cliente…");
        fRespuesta.setPrefRowCount(3);

        javafx.scene.layout.VBox form = new javafx.scene.layout.VBox(8,
                new Label("Precio total (€):"), fPrecio,
                new Label("Mensaje al cliente:"), fRespuesta);
        form.setPadding(new javafx.geometry.Insets(15));
        dialog.getDialogPane().setContent(form);
        dialog.getDialogPane().getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);

        dialog.showAndWait().ifPresent(bt -> {
            if (bt == ButtonType.OK) {
                int id = sel.get("idSolicitud").getAsInt();
                JsonObject body = new JsonObject();
                body.addProperty("respuestaAdmin", fRespuesta.getText().trim());
                try { body.addProperty("precioTotal", Double.parseDouble(fPrecio.getText().trim())); }
                catch (NumberFormatException e) { body.addProperty("precioTotal", 0.0); }

                setStatus("Aprobando solicitud y creando pedido en Odoo…");
                new Thread(() -> {
                    ApiClient.ApiResponse resp = ApiClient.getInstance()
                            .put("/api/solicitudes/" + id + "/aprobar", body);
                    Platform.runLater(() -> {
                        if (resp.isSuccess()) {
                            mostrarInfo("Solicitud aprobada. Pedido de venta creado en Odoo.");
                            lblOdooRef.setText("✅ Pedido Odoo creado para solicitud #" + id);
                            cargarSolicitudes();
                        } else {
                            mostrarError("Error al aprobar. Código: " + resp.getStatusCode());
                            setStatus("Error al aprobar solicitud.");
                        }
                    });
                }).start();
            }
        });
    }

    @FXML
    private void rechazarSolicitud() {
        JsonObject sel = tableSolicitudes.getSelectionModel().getSelectedItem();
        if (sel == null) { mostrarAviso("Selecciona una solicitud."); return; }

        TextInputDialog dialog = new TextInputDialog();
        dialog.setTitle("Rechazar solicitud #" + getStr(sel, "idSolicitud"));
        dialog.setHeaderText("Motivo del rechazo:");
        dialog.setContentText("Mensaje al cliente:");

        dialog.showAndWait().ifPresent(motivo -> {
            int id = sel.get("idSolicitud").getAsInt();
            JsonObject body = new JsonObject();
            body.addProperty("respuestaAdmin", motivo);

            new Thread(() -> {
                ApiClient.ApiResponse resp = ApiClient.getInstance()
                        .put("/api/solicitudes/" + id + "/rechazar", body);
                Platform.runLater(() -> {
                    if (resp.isSuccess()) { mostrarInfo("Solicitud rechazada."); cargarSolicitudes(); }
                    else mostrarError("Error al rechazar. Código: " + resp.getStatusCode());
                });
            }).start();
        });
    }

    @FXML
    private void filtrarSolicitudes() {
        String texto = txtFiltroEstado.getText().toLowerCase().trim();
        if (texto.isEmpty()) {
            listaFiltrada.setAll(listaSolicitudes);
        } else {
            listaFiltrada.clear();
            for (JsonObject s : listaSolicitudes) {
                if (getStr(s, "estado").toLowerCase().contains(texto) ||
                    getNombreCliente(s).toLowerCase().contains(texto)) {
                    listaFiltrada.add(s);
                }
            }
        }
    }

    // ─── Helpers ─────────────────────────────────────

    private String getStr(JsonObject obj, String key) {
        try { return obj.get(key).isJsonNull() ? "" : obj.get(key).getAsString(); }
        catch (Exception e) { return ""; }
    }

    private String getNombreCliente(JsonObject sol) {
        try {
            JsonObject cliente  = sol.getAsJsonObject("cliente");
            JsonObject usuario  = cliente.getAsJsonObject("usuario");
            return usuario.get("nombre").getAsString();
        } catch (Exception e) { return "Desconocido"; }
    }

    private String formatEstado(String estado) {
        return switch (estado) {
            case "pendiente"   -> "🟡 Pendiente";
            case "en_revision" -> "🔵 En revisión";
            case "aprobada"    -> "✅ Aprobada";
            case "rechazada"   -> "❌ Rechazada";
            default -> estado;
        };
    }

    private void setStatus(String msg)   { lblStatusSolicitudes.setText(msg); }
    private void mostrarInfo(String msg) { new Alert(Alert.AlertType.INFORMATION, msg, ButtonType.OK).showAndWait(); }
    private void mostrarAviso(String msg){ new Alert(Alert.AlertType.WARNING, msg, ButtonType.OK).showAndWait(); }
    private void mostrarError(String msg){ new Alert(Alert.AlertType.ERROR, msg, ButtonType.OK).showAndWait(); }
}
