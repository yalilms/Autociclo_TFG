package com.autociclo.controllers;

import com.autociclo.api.ApiClient;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.autociclo.utils.AnimationFactory;
import javafx.application.Platform;
import javafx.beans.property.SimpleStringProperty;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.*;

import java.net.URL;
import java.util.ResourceBundle;

public class SolicitudesController implements Initializable {

    @FXML private TableView<JsonObject>           tableSolicitudes;
    @FXML private TableColumn<JsonObject, String> colSolId;
    @FXML private TableColumn<JsonObject, String> colSolCliente;
    @FXML private TableColumn<JsonObject, String> colSolEstado;
    @FXML private TableColumn<JsonObject, String> colSolFecha;
    @FXML private TableColumn<JsonObject, String> colSolOferta;
    @FXML private TableColumn<JsonObject, String> colSolContrao;
    @FXML private TableColumn<JsonObject, String> colSolOdoo;
    @FXML private TableColumn<JsonObject, String> colSolRespuesta;
    @FXML private TextField txtFiltroEstado;
    @FXML private Label     lblStatusSolicitudes;
    @FXML private Label     lblOdooRef;

    private final ObservableList<JsonObject> listaSolicitudes = FXCollections.observableArrayList();
    private final ObservableList<JsonObject> listaFiltrada    = FXCollections.observableArrayList();

    private int paginaActual = 0;
    private static final int PAGE_SIZE = 8;

    @Override
    public void initialize(URL url, ResourceBundle rb) {
        configurarColumnas();
        tableSolicitudes.setItems(FXCollections.observableArrayList());
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
                new SimpleStringProperty(formatFecha(getStr(d.getValue(), "fechaSolicitud"))));
        colSolOferta.setCellValueFactory(d ->
                new SimpleStringProperty(formatDecimal(d.getValue(), "precioOfertaCliente")));
        colSolContrao.setCellValueFactory(d ->
                new SimpleStringProperty(formatDecimal(d.getValue(), "precioContraoferta")));
        colSolOdoo.setCellValueFactory(d ->
                new SimpleStringProperty(formatOdoo(getStr(d.getValue(), "referenciaOdoo"))));
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
                    paginaActual = 0;
                    actualizarTablaPaginada();
                    setStatus(listaSolicitudes.size() + " solicitudes cargadas.");
                } else {
                    setStatus("Error al cargar (código " + resp.getStatusCode() + ").");
                }
            });
        }).start();
    }

    private void actualizarTablaPaginada() {
        int inicio = paginaActual * PAGE_SIZE;
        int fin = Math.min(inicio + PAGE_SIZE, listaFiltrada.size());
        if (inicio < listaFiltrada.size()) {
            tableSolicitudes.setItems(FXCollections.observableArrayList(listaFiltrada.subList(inicio, fin)));
        } else {
            tableSolicitudes.setItems(FXCollections.observableArrayList());
        }
    }

    public void paginaSiguiente() {
        if (hayPaginaSiguiente()) {
            paginaActual++;
            actualizarTablaPaginada();
            AnimationFactory.playPageChangeAnimation(tableSolicitudes, null);
        }
    }

    public void paginaAnterior() {
        if (hayPaginaAnterior()) {
            paginaActual--;
            actualizarTablaPaginada();
            AnimationFactory.playPageChangeAnimation(tableSolicitudes, null);
        }
    }

    public boolean hayPaginaSiguiente() { return (paginaActual + 1) * PAGE_SIZE < listaFiltrada.size(); }
    public boolean hayPaginaAnterior()  { return paginaActual > 0; }

    @FXML
    private void aprobarSolicitud() {
        JsonObject sel = tableSolicitudes.getSelectionModel().getSelectedItem();
        if (sel == null) { mostrarAviso("Selecciona una solicitud."); return; }

        String estado = getStr(sel, "estado");
        if (!"pendiente".equals(estado) && !"en_negociacion".equals(estado)) {
            mostrarAviso("Solo se pueden aprobar solicitudes pendientes o en negociación.");
            return;
        }

        Dialog<ButtonType> dialog = new Dialog<>();
        dialog.setTitle("Aprobar solicitud #" + getStr(sel, "idSolicitud"));

        TextField fPrecio    = new TextField(); fPrecio.setPromptText("ej: 250.00");
        TextArea  fRespuesta = new TextArea();  fRespuesta.setPromptText("Mensaje para el cliente…");
        fRespuesta.setPrefRowCount(3);
        fPrecio.getStyleClass().add("text-field");
        fRespuesta.setStyle("-fx-background-color: #1e293b; -fx-text-fill: white; -fx-border-color: #334155; -fx-border-radius: 6; -fx-background-radius: 6;");

        // Prellenar con el precio ofertado por el cliente si existe
        String ofertaCliente = formatDecimal(sel, "precioOfertaCliente");
        Label lblOferta = new Label("Oferta del cliente: " + ofertaCliente);
        lblOferta.setStyle("-fx-text-fill: #fbbf24; -fx-font-size: 12px;");

        Label lblCliente = new Label("Cliente: " + getNombreCliente(sel));
        lblCliente.setStyle("-fx-text-fill: #60a5fa; -fx-font-weight: bold; -fx-font-size: 13px;");

        javafx.scene.layout.VBox form = new javafx.scene.layout.VBox(10,
                lblCliente, lblOferta,
                styledLabel("Precio total final (€)"), fPrecio,
                styledLabel("Mensaje al cliente"), fRespuesta);
        form.setPadding(new javafx.geometry.Insets(20));
        form.setPrefWidth(420);
        dialog.getDialogPane().setContent(form);
        dialog.getDialogPane().getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);
        aplicarEstiloDialog(dialog);

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

        if ("rechazada".equals(getStr(sel, "estado")) || "aprobada".equals(getStr(sel, "estado"))) {
            mostrarAviso("Esta solicitud ya está " + getStr(sel, "estado") + ".");
            return;
        }

        Dialog<ButtonType> dialog = new Dialog<>();
        dialog.setTitle("Rechazar solicitud #" + getStr(sel, "idSolicitud"));

        Label lblCliente = new Label("Cliente: " + getNombreCliente(sel));
        lblCliente.setStyle("-fx-text-fill: #f87171; -fx-font-weight: bold; -fx-font-size: 13px;");

        TextArea fMotivo = new TextArea();
        fMotivo.setPromptText("Motivo del rechazo / Mensaje para el cliente…");
        fMotivo.setPrefRowCount(4);
        fMotivo.setWrapText(true);
        fMotivo.setStyle("-fx-background-color: #1e293b; -fx-text-fill: white; -fx-border-color: #334155; -fx-border-radius: 6; -fx-background-radius: 6;");

        javafx.scene.layout.VBox form = new javafx.scene.layout.VBox(10,
                lblCliente, styledLabel("Motivo del rechazo (mensaje al cliente)"), fMotivo);
        form.setPadding(new javafx.geometry.Insets(20));
        form.setPrefWidth(420);

        dialog.getDialogPane().setContent(form);
        dialog.getDialogPane().getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);
        aplicarEstiloDialog(dialog);

        javafx.scene.Node rechazarBtn = dialog.getDialogPane().lookupButton(ButtonType.OK);
        if (rechazarBtn != null) {
            rechazarBtn.getStyleClass().remove("button-success");
            rechazarBtn.getStyleClass().add("button-danger");
            ((Button) rechazarBtn).setText("Rechazar");
        }

        dialog.showAndWait().ifPresent(bt -> {
            if (bt == ButtonType.OK) {
                int id = sel.get("idSolicitud").getAsInt();
                JsonObject body = new JsonObject();
                body.addProperty("respuestaAdmin", fMotivo.getText().trim());
                new Thread(() -> {
                    ApiClient.ApiResponse resp = ApiClient.getInstance()
                            .put("/api/solicitudes/" + id + "/rechazar", body);
                    Platform.runLater(() -> {
                        if (resp.isSuccess()) { mostrarInfo("Solicitud rechazada."); cargarSolicitudes(); }
                        else mostrarError("Error al rechazar. Código: " + resp.getStatusCode());
                    });
                }).start();
            }
        });
    }

    @FXML
    private void contraofertarSolicitud() {
        JsonObject sel = tableSolicitudes.getSelectionModel().getSelectedItem();
        if (sel == null) { mostrarAviso("Selecciona una solicitud."); return; }

        String estado = getStr(sel, "estado");
        if ("aprobada".equals(estado) || "rechazada".equals(estado)) {
            mostrarAviso("No se puede contraofertar una solicitud " + estado + ".");
            return;
        }

        Dialog<ButtonType> dialog = new Dialog<>();
        dialog.setTitle("Contraoferta — solicitud #" + getStr(sel, "idSolicitud"));

        String ofertaActual = formatDecimal(sel, "precioOfertaCliente");
        Label lblCliente = new Label("Cliente: " + getNombreCliente(sel));
        lblCliente.setStyle("-fx-text-fill: #a78bfa; -fx-font-weight: bold; -fx-font-size: 13px;");
        Label lblOferta = new Label("Oferta del cliente: " + ofertaActual);
        lblOferta.setStyle("-fx-text-fill: #fbbf24; -fx-font-size: 12px;");

        TextField fPrecio = new TextField();
        fPrecio.setPromptText("Precio que propones (€)");
        fPrecio.getStyleClass().add("text-field");

        TextArea fMensaje = new TextArea();
        fMensaje.setPromptText("Justificación o mensaje al cliente…");
        fMensaje.setPrefRowCount(3);
        fMensaje.setWrapText(true);
        fMensaje.setStyle("-fx-background-color: #1e293b; -fx-text-fill: white; -fx-border-color: #334155; -fx-border-radius: 6; -fx-background-radius: 6;");

        javafx.scene.layout.VBox form = new javafx.scene.layout.VBox(10,
                lblCliente, lblOferta,
                styledLabel("Tu contraoferta (€)"), fPrecio,
                styledLabel("Mensaje al cliente"), fMensaje);
        form.setPadding(new javafx.geometry.Insets(20));
        form.setPrefWidth(420);

        dialog.getDialogPane().setContent(form);
        dialog.getDialogPane().getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);
        aplicarEstiloDialog(dialog);

        javafx.scene.Node okBtn = dialog.getDialogPane().lookupButton(ButtonType.OK);
        if (okBtn != null) ((Button) okBtn).setText("Enviar contraoferta");

        dialog.showAndWait().ifPresent(bt -> {
            if (bt == ButtonType.OK) {
                double precio;
                try { precio = Double.parseDouble(fPrecio.getText().trim()); }
                catch (NumberFormatException e) { mostrarAviso("Introduce un precio válido."); return; }

                int id = sel.get("idSolicitud").getAsInt();
                JsonObject body = new JsonObject();
                body.addProperty("precio", precio);
                body.addProperty("mensaje", fMensaje.getText().trim());

                setStatus("Enviando contraoferta…");
                new Thread(() -> {
                    ApiClient.ApiResponse resp = ApiClient.getInstance()
                            .put("/api/solicitudes/" + id + "/contraoferta", body);
                    Platform.runLater(() -> {
                        if (resp.isSuccess()) {
                            mostrarInfo("Contraoferta enviada. El cliente recibirá una notificación.");
                            cargarSolicitudes();
                        } else {
                            mostrarError("Error al enviar contraoferta. Código: " + resp.getStatusCode());
                            setStatus("Error al enviar contraoferta.");
                        }
                    });
                }).start();
            }
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
        paginaActual = 0;
        actualizarTablaPaginada();
    }

    // ─── Helpers ─────────────────────────────────────

    private String getStr(JsonObject obj, String key) {
        try { return obj.get(key).isJsonNull() ? "" : obj.get(key).getAsString(); }
        catch (Exception e) { return ""; }
    }

    private String getNombreCliente(JsonObject sol) {
        try {
            return sol.getAsJsonObject("cliente").getAsJsonObject("usuario").get("nombre").getAsString();
        } catch (Exception e) { return "Desconocido"; }
    }

    private String formatFecha(String fecha) {
        if (fecha == null || fecha.isEmpty()) return "";
        try { return fecha.replace("T", "  ").substring(0, 17); }
        catch (Exception e) { return fecha; }
    }

    private String formatDecimal(JsonObject sol, String campo) {
        try {
            if (sol.get(campo) == null || sol.get(campo).isJsonNull()) return "—";
            return String.format("%.2f €", sol.get(campo).getAsDouble());
        } catch (Exception e) { return "—"; }
    }

    private String formatOdoo(String ref) {
        return (ref == null || ref.isEmpty()) ? "—" : ref;
    }

    private String formatEstado(String estado) {
        return switch (estado) {
            case "pendiente"      -> "🟡 Pendiente";
            case "en_negociacion" -> "🔵 En negociación";
            case "aprobada"       -> "✅ Aprobada";
            case "rechazada"      -> "❌ Rechazada";
            default -> estado;
        };
    }

    private void setStatus(String msg) { lblStatusSolicitudes.setText(msg); }

    private void mostrarInfo(String msg)  { Alert a = new Alert(Alert.AlertType.INFORMATION, msg, ButtonType.OK); aplicarEstiloAlert(a); a.showAndWait(); }
    private void mostrarAviso(String msg) { Alert a = new Alert(Alert.AlertType.WARNING,     msg, ButtonType.OK); aplicarEstiloAlert(a); a.showAndWait(); }
    private void mostrarError(String msg) { Alert a = new Alert(Alert.AlertType.ERROR,       msg, ButtonType.OK); aplicarEstiloAlert(a); a.showAndWait(); }

    private void aplicarEstiloAlert(Alert alert) {
        alert.getDialogPane().getStylesheets().add(
                getClass().getResource("/css/styles.css").toExternalForm());
        alert.getDialogPane().getStyleClass().add("glass-pane");
        alert.getDialogPane().setStyle("-fx-background-color: #0f172a;");
    }

    private void aplicarEstiloDialog(Dialog<?> dialog) {
        dialog.getDialogPane().getStylesheets().add(
                getClass().getResource("/css/styles.css").toExternalForm());
        dialog.getDialogPane().getStyleClass().add("glass-pane");
        dialog.getDialogPane().setStyle("-fx-background-color: #0f172a;");
        javafx.scene.Node okBtn     = dialog.getDialogPane().lookupButton(ButtonType.OK);
        javafx.scene.Node cancelBtn = dialog.getDialogPane().lookupButton(ButtonType.CANCEL);
        if (okBtn     != null) { okBtn.getStyleClass().add("button-success"); ((Button) okBtn).setText("Aceptar"); }
        if (cancelBtn != null) { cancelBtn.getStyleClass().add("button"); ((Button) cancelBtn).setText("Cancelar"); }
    }

    private Label styledLabel(String texto) {
        Label lbl = new Label(texto);
        lbl.setStyle("-fx-text-fill: #94a3b8; -fx-font-size: 12px;");
        return lbl;
    }
}
