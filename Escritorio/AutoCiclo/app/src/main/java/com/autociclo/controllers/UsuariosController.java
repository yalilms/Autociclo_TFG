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

/**
 * Controlador del módulo de Gestión de Usuarios.
 * Consume la API REST: GET/POST/PUT/DELETE /api/usuarios
 *
 * @author Yalil Musa Talhaoui
 */
public class UsuariosController implements Initializable {

    // ─── FXML ────────────────────────────────────────
    @FXML private TableView<JsonObject>               tableUsuarios;
    @FXML private TableColumn<JsonObject, String>     colUsuarioId;
    @FXML private TableColumn<JsonObject, String>     colUsuarioNombre;
    @FXML private TableColumn<JsonObject, String>     colUsuarioEmail;
    @FXML private TableColumn<JsonObject, String>     colUsuarioRol;
    @FXML private TableColumn<JsonObject, String>     colUsuarioActivo;
    @FXML private TableColumn<JsonObject, String>     colUsuarioFecha;
    @FXML private TextField                            txtBuscarUsuario;
    @FXML private Label                                lblStatusUsuarios;
    @FXML private Button                               btnNuevoUsuario;
    @FXML private Button                               btnEditarUsuario;
    @FXML private Button                               btnToggleActivo;
    @FXML private Button                               btnResetPassword;

    private final ObservableList<JsonObject> listaUsuarios = FXCollections.observableArrayList();
    private final ObservableList<JsonObject> listaFiltrada = FXCollections.observableArrayList();

    private int paginaActual = 0;
    private static final int PAGE_SIZE = 8;

    private int getPageSize() {
        if (tableUsuarios != null && tableUsuarios.getHeight() > 60) {
            int rows = (int) ((tableUsuarios.getHeight() - 30) / 27);
            return Math.max(rows, 5);
        }
        return PAGE_SIZE;
    }

    @Override
    public void initialize(URL url, ResourceBundle rb) {
        configurarColumnas();
        tableUsuarios.setItems(FXCollections.observableArrayList());
        cargarUsuarios();
    }

    // ─── Configuración de columnas ───────────────────

    private void configurarColumnas() {
        colUsuarioId.setCellValueFactory(data ->
                new SimpleStringProperty(getStr(data.getValue(), "idUsuario")));
        colUsuarioNombre.setCellValueFactory(data ->
                new SimpleStringProperty(getStr(data.getValue(), "nombre")));
        colUsuarioEmail.setCellValueFactory(data ->
                new SimpleStringProperty(getStr(data.getValue(), "email")));
        colUsuarioRol.setCellValueFactory(data ->
                new SimpleStringProperty(getRol(data.getValue())));
        colUsuarioActivo.setCellValueFactory(data ->
                new SimpleStringProperty(isActivo(data.getValue()) ? "✅ Activo" : "❌ Inactivo"));
        colUsuarioFecha.setCellValueFactory(data ->
                new SimpleStringProperty(getStr(data.getValue(), "fechaAlta")));
    }

    // ─── Carga de datos ──────────────────────────────

    private void cargarUsuarios() {
        setStatus("Cargando usuarios desde la API…");
        new Thread(() -> {
            ApiClient.ApiResponse resp = ApiClient.getInstance().get("/api/usuarios");
            Platform.runLater(() -> {
                if (resp.isSuccess()) {
                    listaUsuarios.clear();
                    JsonArray arr = JsonParser.parseString(resp.getBody()).getAsJsonArray();
                    arr.forEach(e -> listaUsuarios.add(e.getAsJsonObject()));
                    listaFiltrada.setAll(listaUsuarios);
                    paginaActual = 0;
                    actualizarTablaPaginada();
                    setStatus(listaUsuarios.size() + " usuarios cargados.");
                } else {
                    setStatus("Error al cargar usuarios (código " + resp.getStatusCode() + ").");
                }
            });
        }).start();
    }

    private void actualizarTablaPaginada() {
        int inicio = paginaActual * getPageSize();
        int fin = Math.min(inicio + getPageSize(), listaFiltrada.size());
        if (inicio < listaFiltrada.size()) {
            tableUsuarios.setItems(FXCollections.observableArrayList(listaFiltrada.subList(inicio, fin)));
        } else {
            tableUsuarios.setItems(FXCollections.observableArrayList());
        }
    }

    public void paginaSiguiente() {
        if (hayPaginaSiguiente()) {
            paginaActual++;
            actualizarTablaPaginada();
            AnimationFactory.playPageChangeAnimation(tableUsuarios, null);
        }
    }

    public void paginaAnterior() {
        if (hayPaginaAnterior()) {
            paginaActual--;
            actualizarTablaPaginada();
            AnimationFactory.playPageChangeAnimation(tableUsuarios, null);
        }
    }

    public boolean hayPaginaSiguiente() {
        return (paginaActual + 1) * getPageSize() < listaFiltrada.size();
    }

    public boolean hayPaginaAnterior() {
        return paginaActual > 0;
    }

    // ─── Acciones ────────────────────────────────────

    @FXML
    private void abrirFormularioNuevo() {
        Dialog<ButtonType> dialog = new Dialog<>();
        dialog.setTitle("Nuevo Usuario");

        Label lblTitulo = new Label("Nuevo Usuario");
        lblTitulo.setStyle("-fx-font-size: 17px; -fx-font-weight: bold; -fx-text-fill: white;");
        Label lblSub = new Label("Rellena los datos para crear una nueva cuenta de acceso");
        lblSub.setStyle("-fx-font-size: 12px; -fx-text-fill: #94a3b8;");
        javafx.scene.layout.VBox header = new javafx.scene.layout.VBox(4, lblTitulo, lblSub);
        header.setStyle("-fx-padding: 0 0 15 0; -fx-border-color: rgba(255,255,255,0.1); -fx-border-width: 0 0 1 0;");

        TextField fNombre   = new TextField(); fNombre.setPromptText("Nombre completo");
        TextField fEmailPre = new TextField(); fEmailPre.setPromptText("nombre.apellido");
        fEmailPre.setPrefWidth(230);
        Label lblDominio = new Label("@autociclo.es");
        lblDominio.setStyle("-fx-text-fill: #94a3b8; -fx-font-size: 13px; -fx-padding: 0 0 0 4;");
        javafx.scene.layout.HBox emailBox = new javafx.scene.layout.HBox(0, fEmailPre, lblDominio);
        emailBox.setAlignment(javafx.geometry.Pos.CENTER_LEFT);
        emailBox.setStyle("-fx-background-color: rgba(30,41,59,0.8); -fx-border-color: rgba(255,255,255,0.1); -fx-border-radius: 6; -fx-background-radius: 6; -fx-padding: 0 10 0 0;");
        fEmailPre.setStyle("-fx-background-color: transparent; -fx-text-fill: white; -fx-border-color: transparent; -fx-font-size: 13px; -fx-padding: 8 4 8 10;");

        PasswordField fPass = new PasswordField(); fPass.setPromptText("Mínimo 6 caracteres");
        ComboBox<String> fRol = new ComboBox<>();
        fRol.getItems().addAll("ADMIN", "EMPLEADO");
        fRol.setValue("EMPLEADO");
        fRol.setMaxWidth(Double.MAX_VALUE);
        fRol.setStyle("-fx-background-color: rgba(30,41,59,0.8); -fx-text-fill: white; -fx-border-color: rgba(255,255,255,0.1); -fx-border-radius: 6; -fx-background-radius: 6; -fx-pref-height: 35px;");

        fNombre.getStyleClass().add("text-field");
        fPass.getStyleClass().add("text-field");

        javafx.scene.layout.VBox campos = new javafx.scene.layout.VBox(8,
                styledLabel("Nombre *"),     fNombre,
                styledLabel("Email *"),      emailBox,
                styledLabel("Contraseña *"), fPass,
                styledLabel("Rol"),          fRol);

        javafx.scene.layout.VBox form = new javafx.scene.layout.VBox(15, header, campos);
        form.setPadding(new javafx.geometry.Insets(20));
        form.setPrefWidth(420);

        dialog.getDialogPane().setContent(form);
        dialog.getDialogPane().getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);
        aplicarEstiloDialog(dialog);

        javafx.scene.Node okBtn = dialog.getDialogPane().lookupButton(ButtonType.OK);
        if (okBtn != null) ((javafx.scene.control.Button) okBtn).setText("Crear usuario");

        dialog.showAndWait().ifPresent(bt -> {
            if (bt == ButtonType.OK) {
                String prefijo = fEmailPre.getText().trim().toLowerCase().replaceAll("[^a-z0-9._-]", "");
                if (prefijo.isEmpty()) {
                    mostrarError("El email no puede estar vacío.");
                    return;
                }
                String email = prefijo + "@autociclo.es";
                crearUsuario(fNombre.getText().trim(), email, fPass.getText(), fRol.getValue());
            }
        });
    }

    private void crearUsuario(String nombre, String email, String password, String rol) {
        JsonObject body = new JsonObject();
        body.addProperty("nombre",    nombre);
        body.addProperty("email",     email);
        body.addProperty("password",  password);
        body.addProperty("rolNombre", rol); // API espera: ADMIN, EMPLEADO o CLIENTE

        new Thread(() -> {
            ApiClient.ApiResponse resp = ApiClient.getInstance().post("/api/usuarios", body);
            Platform.runLater(() -> {
                if (resp.isSuccess()) {
                    mostrarInfo("Usuario creado correctamente.");
                    cargarUsuarios();
                } else {
                    mostrarError("No se pudo crear el usuario. Código: " + resp.getStatusCode());
                }
            });
        }).start();
    }

    @FXML
    private void editarUsuario() {
        JsonObject sel = tableUsuarios.getSelectionModel().getSelectedItem();
        if (sel == null) { mostrarAviso("Selecciona un usuario para editar."); return; }

        Label lblTitulo = new Label("Editar Usuario");
        lblTitulo.setStyle("-fx-font-size: 17px; -fx-font-weight: bold; -fx-text-fill: white;");
        Label lblSub = new Label(getStr(sel, "nombre") + "  ·  " + getRol(sel));
        lblSub.setStyle("-fx-font-size: 12px; -fx-text-fill: #94a3b8;");
        javafx.scene.layout.VBox header = new javafx.scene.layout.VBox(4, lblTitulo, lblSub);
        header.setStyle("-fx-padding: 0 0 15 0; -fx-border-color: rgba(255,255,255,0.1); -fx-border-width: 0 0 1 0;");

        TextField fNombre = new TextField(getStr(sel, "nombre"));
        fNombre.getStyleClass().add("text-field");

        Label lblEmailVal = new Label(getStr(sel, "email"));
        lblEmailVal.setStyle("-fx-text-fill: #64748b; -fx-font-size: 13px; -fx-padding: 8 10; "
                + "-fx-background-color: rgba(15,23,42,0.5); -fx-background-radius: 6; "
                + "-fx-border-color: rgba(255,255,255,0.05); -fx-border-radius: 6;");

        javafx.scene.layout.VBox campos = new javafx.scene.layout.VBox(8,
                styledLabel("Nombre"),
                fNombre,
                styledLabel("Email (solo lectura)"),
                lblEmailVal);

        javafx.scene.layout.VBox form = new javafx.scene.layout.VBox(15, header, campos);
        form.setPadding(new javafx.geometry.Insets(20));
        form.setPrefWidth(420);

        Dialog<ButtonType> dialog = new Dialog<>();
        dialog.setTitle("Editar Usuario");
        dialog.getDialogPane().setContent(form);
        dialog.getDialogPane().getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);
        aplicarEstiloDialog(dialog);

        javafx.scene.Node okBtn = dialog.getDialogPane().lookupButton(ButtonType.OK);
        if (okBtn != null) ((javafx.scene.control.Button) okBtn).setText("Guardar cambios");

        dialog.showAndWait().ifPresent(bt -> {
            if (bt == ButtonType.OK) {
                int id = sel.get("idUsuario").getAsInt();
                JsonObject body = new JsonObject();
                body.addProperty("nombre",    fNombre.getText().trim());
                body.addProperty("email",     getStr(sel, "email"));
                body.addProperty("rolNombre", getRol(sel));

                new Thread(() -> {
                    ApiClient.ApiResponse resp = ApiClient.getInstance().put("/api/usuarios/" + id, body);
                    Platform.runLater(() -> {
                        if (resp.isSuccess()) { mostrarInfo("Usuario actualizado."); cargarUsuarios(); }
                        else mostrarError("Error al actualizar. Código: " + resp.getStatusCode());
                    });
                }).start();
            }
        });
    }

    @FXML
    private void toggleActivo() {
        JsonObject sel = tableUsuarios.getSelectionModel().getSelectedItem();
        if (sel == null) { mostrarAviso("Selecciona un usuario."); return; }
        int id = sel.get("idUsuario").getAsInt();
        boolean activo = isActivo(sel);
        String accion = activo ? "desactivar" : "activar";

        Alert confirm = new Alert(Alert.AlertType.CONFIRMATION,
                "¿Deseas " + accion + " a " + getStr(sel, "nombre") + "?",
                ButtonType.YES, ButtonType.NO);
        confirm.setTitle("Confirmar acción");
        confirm.setHeaderText((activo ? "⚠️  Desactivar" : "✅  Activar") + " usuario");
        aplicarEstiloAlert(confirm);
        confirm.showAndWait().ifPresent(bt -> {
            if (bt == ButtonType.YES) {
                new Thread(() -> {
                    ApiClient.ApiResponse resp = ApiClient.getInstance().delete("/api/usuarios/" + id);
                    Platform.runLater(() -> {
                        if (resp.isSuccess()) { mostrarInfo("Usuario " + accion + "do."); cargarUsuarios(); }
                        else mostrarError("Error. Código: " + resp.getStatusCode());
                    });
                }).start();
            }
        });
    }

    @FXML
    private void resetPassword() {
        JsonObject sel = tableUsuarios.getSelectionModel().getSelectedItem();
        if (sel == null) { mostrarAviso("Selecciona un usuario primero."); return; }

        String nombre = getStr(sel, "nombre");
        int id = sel.get("idUsuario").getAsInt();

        TextInputDialog dialog = new TextInputDialog();
        dialog.setTitle("Restablecer contraseña");
        dialog.setHeaderText("Nueva contraseña para: " + nombre);
        dialog.setContentText("Nueva contraseña (mín. 6 caracteres):");
        aplicarEstiloDialog(dialog);

        dialog.showAndWait().ifPresent(nuevaPassword -> {
            if (nuevaPassword == null || nuevaPassword.isBlank() || nuevaPassword.length() < 6) {
                mostrarError("La contraseña debe tener al menos 6 caracteres.");
                return;
            }
            JsonObject body = new JsonObject();
            body.addProperty("password", nuevaPassword);
            new Thread(() -> {
                ApiClient.ApiResponse resp = ApiClient.getInstance().put("/api/usuarios/" + id + "/password", body);
                Platform.runLater(() -> {
                    if (resp.isSuccess()) {
                        mostrarInfo("Contraseña de " + nombre + " restablecida correctamente.");
                    } else {
                        mostrarError("No se pudo restablecer la contraseña. Código: " + resp.getStatusCode());
                    }
                });
            }).start();
        });
    }

    @FXML
    private void filtrarUsuarios() {
        String texto = txtBuscarUsuario.getText().toLowerCase().trim();
        if (texto.isEmpty()) {
            listaFiltrada.setAll(listaUsuarios);
        } else {
            listaFiltrada.clear();
            for (JsonObject u : listaUsuarios) {
                if (getStr(u, "nombre").toLowerCase().contains(texto) ||
                    getStr(u, "email").toLowerCase().contains(texto) ||
                    getRol(u).toLowerCase().contains(texto)) {
                    listaFiltrada.add(u);
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

    private String getRol(JsonObject obj) {
        try {
            JsonObject rol = obj.getAsJsonObject("rol");
            return rol != null ? rol.get("nombre").getAsString() : "";
        } catch (Exception e) { return ""; }
    }


    private boolean isActivo(JsonObject obj) {
        try { return obj.get("activo").getAsBoolean(); }
        catch (Exception e) { return true; }
    }

    private void setStatus(String msg) { lblStatusUsuarios.setText(msg); }

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
        // Botones
        javafx.scene.Node okBtn = dialog.getDialogPane().lookupButton(ButtonType.OK);
        javafx.scene.Node cancelBtn = dialog.getDialogPane().lookupButton(ButtonType.CANCEL);
        if (okBtn != null) {
            okBtn.getStyleClass().addAll("button-success");
            ((javafx.scene.control.Button) okBtn).setText("Aceptar");
        }
        if (cancelBtn != null) {
            cancelBtn.getStyleClass().add("button");
            ((javafx.scene.control.Button) cancelBtn).setText("Cancelar");
        }
    }

    private Label styledLabel(String texto) {
        Label lbl = new Label(texto);
        lbl.getStyleClass().add("label");
        lbl.setStyle("-fx-text-fill: #94a3b8; -fx-font-size: 12px;");
        return lbl;
    }
}
