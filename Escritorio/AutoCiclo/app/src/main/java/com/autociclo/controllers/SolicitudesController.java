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
    @FXML private TableColumn<JsonObject, String> colSolTurno;
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
        colSolTurno.setCellValueFactory(d ->
                new SimpleStringProperty(formatTurno(d.getValue())));

        // Doble clic → historial de negociación
        tableSolicitudes.setRowFactory(tv -> {
            TableRow<JsonObject> row = new TableRow<>();
            row.setOnMouseClicked(e -> {
                if (e.getClickCount() == 2 && !row.isEmpty()) {
                    mostrarHistorial(row.getItem());
                }
            });
            return row;
        });
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

        // Precio acordado: última oferta del cliente (no editable)
        double _pa = 0.0;
        try { _pa = sel.get("precioOfertaCliente").getAsDouble(); } catch (Exception ignored) {}
        final double precioAcordado = _pa;
        String precioFmt = String.format("%.2f €", precioAcordado);

        // Confirmación previa
        Alert confirm = new Alert(Alert.AlertType.CONFIRMATION);
        confirm.setTitle("Confirmar aprobación");
        confirm.setHeaderText("¿Aprobar solicitud #" + getStr(sel, "idSolicitud") + "?");
        confirm.setContentText(
            "Cliente: " + getNombreCliente(sel) + "\n" +
            "Precio acordado: " + precioFmt + "\n\n" +
            "Se creará un pedido de venta en Odoo y el cliente\n" +
            "recibirá una notificación con botón de pago."
        );
        confirm.getButtonTypes().setAll(ButtonType.YES, ButtonType.NO);
        aplicarEstiloAlert(confirm);
        javafx.scene.Node yesBtn = confirm.getDialogPane().lookupButton(ButtonType.YES);
        if (yesBtn != null) { yesBtn.getStyleClass().add("button-success"); ((Button) yesBtn).setText("Sí, aprobar"); }
        javafx.scene.Node noBtn = confirm.getDialogPane().lookupButton(ButtonType.NO);
        if (noBtn != null) { noBtn.getStyleClass().add("button"); ((Button) noBtn).setText("Cancelar"); }

        confirm.showAndWait().ifPresent(bt -> {
            if (bt == ButtonType.YES) {
                int id = sel.get("idSolicitud").getAsInt();
                JsonObject body = new JsonObject();
                body.addProperty("respuestaAdmin",
                    "Solicitud aprobada. Pedido generado en Odoo. Contactaremos para la entrega.");
                body.addProperty("precioTotal", precioAcordado);

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

        String estadoSel = getStr(sel, "estado");
        if ("rechazada".equals(estadoSel) || "aprobada".equals(estadoSel) || "pagada".equals(estadoSel)) {
            mostrarAviso("Esta solicitud ya está " + estadoSel + " y no se puede rechazar.");
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
            case "pagada"         -> "💰 Pagada";
            default -> estado;
        };
    }

    private String formatTurno(JsonObject sol) {
        String estado = getStr(sol, "estado");
        String turno  = getStr(sol, "turno");
        return switch (estado) {
            case "pendiente"      -> "⏳ Pendiente de revisión";
            case "en_negociacion" -> "admin".equals(turno) ? "⚡ Tu turno" : "⏳ Turno del cliente";
            case "aprobada"       -> "✅ Trato cerrado";
            case "rechazada"      -> "❌ Cerrada";
            case "pagada"         -> "💰 Pagada y completada";
            default               -> "";
        };
    }

    private void mostrarHistorial(JsonObject sol) {
        int id = sol.get("idSolicitud").getAsInt();
        String cliente  = getNombreCliente(sol);
        String oferta   = formatDecimal(sol, "precioOfertaCliente");
        String contrao  = formatDecimal(sol, "precioContraoferta");
        String turnoStr = formatTurno(sol);

        // ── Cabecera (fija, fuera del scroll) ───────────────────────────
        Label lblCliente = new Label("Cliente: " + cliente);
        lblCliente.setStyle("-fx-text-fill: #60a5fa; -fx-font-weight: bold; -fx-font-size: 14px;");

        Label lblOfe = new Label("Oferta cliente: " + oferta);
        lblOfe.setStyle("-fx-text-fill: #fbbf24; -fx-font-size: 12px; -fx-font-weight: bold;");
        Label lblCon = new Label("Contraoferta: " + contrao);
        lblCon.setStyle("-fx-text-fill: #a78bfa; -fx-font-size: 12px; -fx-font-weight: bold;");
        Label lblTurno = new Label(turnoStr);
        boolean esTuTurno = turnoStr.contains("Tu turno");
        lblTurno.setStyle("-fx-text-fill: " + (esTuTurno ? "#34d399" : "#fbbf24") + "; -fx-font-size: 12px; -fx-font-weight: bold;");

        javafx.scene.layout.HBox hResumen = new javafx.scene.layout.HBox(20, lblOfe, lblCon, lblTurno);
        hResumen.setAlignment(javafx.geometry.Pos.CENTER_LEFT);

        // ── Zona de burbujas (con scroll) ───────────────────────────────
        javafx.scene.layout.VBox burbujas = new javafx.scene.layout.VBox(10);
        burbujas.setPadding(new javafx.geometry.Insets(4, 8, 4, 8));

        Label lblCargando = new Label("Cargando historial…");
        lblCargando.setStyle("-fx-text-fill: #94a3b8; -fx-font-size: 12px;");
        burbujas.getChildren().add(lblCargando);

        javafx.scene.control.ScrollPane scroll = new javafx.scene.control.ScrollPane(burbujas);
        scroll.setFitToWidth(true);
        scroll.setPrefHeight(340);
        scroll.setStyle("-fx-background: #0f172a; -fx-background-color: #0f172a; -fx-border-color: transparent;");
        scroll.setHbarPolicy(javafx.scene.control.ScrollPane.ScrollBarPolicy.NEVER);

        // ── Layout principal ─────────────────────────────────────────────
        javafx.scene.layout.VBox contenido = new javafx.scene.layout.VBox(10,
                lblCliente, hResumen, new Separator(), scroll);
        contenido.setPadding(new javafx.geometry.Insets(20));
        contenido.setPrefWidth(580);

        Dialog<Void> dialog = new Dialog<>();
        dialog.setTitle("Historial de negociación — Solicitud #" + id);
        dialog.setResizable(true);
        dialog.getDialogPane().setContent(contenido);
        dialog.getDialogPane().setPrefSize(620, 500);
        dialog.getDialogPane().getButtonTypes().add(ButtonType.CLOSE);
        aplicarEstiloDialog(dialog);

        javafx.scene.Node closeBtn = dialog.getDialogPane().lookupButton(ButtonType.CLOSE);
        if (closeBtn != null) {
            closeBtn.getStyleClass().clear();
            closeBtn.getStyleClass().add("button");
            ((Button) closeBtn).setText("Cerrar");
        }
        // Quitar el botón OK que añade aplicarEstiloDialog
        javafx.scene.Node okBtn = dialog.getDialogPane().lookupButton(ButtonType.OK);
        if (okBtn != null) okBtn.setVisible(false);

        dialog.show();

        // ── Cargar rondas en background ──────────────────────────────────
        new Thread(() -> {
            ApiClient.ApiResponse resp = ApiClient.getInstance().get("/api/solicitudes/" + id + "/historial");
            Platform.runLater(() -> {
                burbujas.getChildren().remove(lblCargando);

                if (!resp.isSuccess()) {
                    burbujas.getChildren().add(styledLabel("No se pudo cargar el historial."));
                    return;
                }
                JsonArray historial = JsonParser.parseString(resp.getBody()).getAsJsonArray();
                if (historial.isEmpty()) {
                    burbujas.getChildren().add(styledLabel("Sin rondas de negociación registradas."));
                    return;
                }

                for (int i = 0; i < historial.size(); i++) {
                    JsonObject ronda    = historial.get(i).getAsJsonObject();
                    String autor        = getStr(ronda, "autor");
                    String precio       = String.format("%.2f €", ronda.get("precio").getAsDouble());
                    String numRonda     = getStr(ronda, "ronda");
                    String mensaje      = getStr(ronda, "mensaje");
                    boolean esUltimo    = (i == historial.size() - 1);
                    boolean esAdmin     = "admin".equals(autor);

                    String colorFondo  = esAdmin ? "#1e1b4b" : "#0c2441";
                    String colorBorde  = esAdmin ? "#4c1d95" : "#1e3a5f";
                    String colorAutor  = esAdmin ? "#a78bfa" : "#60a5fa";
                    String nombreAutor = esAdmin ? "Admin (Tú)" : "Cliente";

                    javafx.scene.layout.VBox bubble = new javafx.scene.layout.VBox(5);
                    bubble.setStyle(String.format(
                        "-fx-background-color: %s; -fx-border-color: %s; -fx-border-radius: 10;" +
                        "-fx-background-radius: 10; -fx-border-width: %s;",
                        colorFondo, colorBorde, esUltimo ? "2" : "1"
                    ));
                    bubble.setPadding(new javafx.geometry.Insets(12));
                    bubble.setMaxWidth(380);

                    Label lblTitulo = new Label("Ronda " + numRonda + " — " + nombreAutor + (esUltimo ? "  ★ ÚLTIMO" : ""));
                    lblTitulo.setStyle("-fx-text-fill: " + colorAutor + "; -fx-font-weight: bold; -fx-font-size: 11px;");

                    Label lblPrecio = new Label(precio);
                    lblPrecio.setStyle("-fx-text-fill: white; -fx-font-weight: bold; -fx-font-size: 20px; -fx-font-family: 'Courier New', monospace;");

                    bubble.getChildren().addAll(lblTitulo, lblPrecio);

                    if (!mensaje.isEmpty()) {
                        Label lblMsg = new Label("\" " + mensaje + " \"");
                        lblMsg.setStyle("-fx-text-fill: #94a3b8; -fx-font-style: italic; -fx-font-size: 11px;");
                        lblMsg.setWrapText(true);
                        lblMsg.setMaxWidth(340);
                        bubble.getChildren().add(lblMsg);
                    }

                    javafx.scene.layout.HBox fila = new javafx.scene.layout.HBox();
                    javafx.scene.layout.Region spacer = new javafx.scene.layout.Region();
                    javafx.scene.layout.HBox.setHgrow(spacer, javafx.scene.layout.Priority.ALWAYS);
                    if (esAdmin) {
                        fila.getChildren().addAll(spacer, bubble);
                    } else {
                        fila.getChildren().addAll(bubble, spacer);
                    }
                    burbujas.getChildren().add(fila);
                }

                // Scroll al final para ver el último mensaje
                scroll.setVvalue(1.0);
            });
        }).start();
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
