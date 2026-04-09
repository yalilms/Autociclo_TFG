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

    private final ObservableList<JsonObject> listaUsuarios = FXCollections.observableArrayList();
    private final ObservableList<JsonObject> listaFiltrada = FXCollections.observableArrayList();

    @Override
    public void initialize(URL url, ResourceBundle rb) {
        configurarColumnas();
        tableUsuarios.setItems(listaFiltrada);
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
                    setStatus(listaUsuarios.size() + " usuarios cargados.");
                } else {
                    setStatus("Error al cargar usuarios (código " + resp.getStatusCode() + ").");
                }
            });
        }).start();
    }

    // ─── Acciones ────────────────────────────────────

    @FXML
    private void abrirFormularioNuevo() {
        Dialog<ButtonType> dialog = new Dialog<>();
        dialog.setTitle("Nuevo Usuario");
        dialog.setHeaderText("Crear nuevo usuario en el sistema");

        TextField fNombre   = new TextField(); fNombre.setPromptText("Nombre completo");
        TextField fEmail    = new TextField(); fEmail.setPromptText("correo@ejemplo.com");
        PasswordField fPass = new PasswordField(); fPass.setPromptText("Contraseña (mín. 6 caracteres)");
        ComboBox<String> fRol = new ComboBox<>();
        fRol.getItems().addAll("ADMIN", "EMPLEADO");
        fRol.setValue("EMPLEADO");

        javafx.scene.layout.VBox form = new javafx.scene.layout.VBox(8,
                new Label("Nombre:"), fNombre,
                new Label("Email:"),  fEmail,
                new Label("Contraseña:"), fPass,
                new Label("Rol:"), fRol);
        form.setPadding(new javafx.geometry.Insets(15));
        dialog.getDialogPane().setContent(form);
        dialog.getDialogPane().getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);

        dialog.showAndWait().ifPresent(bt -> {
            if (bt == ButtonType.OK) {
                crearUsuario(fNombre.getText().trim(), fEmail.getText().trim(),
                             fPass.getText(), fRol.getValue());
            }
        });
    }

    private void crearUsuario(String nombre, String email, String password, String rol) {
        JsonObject body = new JsonObject();
        body.addProperty("nombre",   nombre);
        body.addProperty("email",    email);
        body.addProperty("password", password);
        // idRol: 1=ADMIN, 2=EMPLEADO, 3=CLIENTE
        body.addProperty("idRol", "ADMIN".equals(rol) ? 1 : 2);

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

        TextField fNombre = new TextField(getStr(sel, "nombre"));
        TextField fEmail  = new TextField(getStr(sel, "email"));
        fEmail.setDisable(true);

        Dialog<ButtonType> dialog = new Dialog<>();
        dialog.setTitle("Editar Usuario");
        dialog.setHeaderText("Editar: " + getStr(sel, "nombre"));
        javafx.scene.layout.VBox form = new javafx.scene.layout.VBox(8,
                new Label("Nombre:"), fNombre,
                new Label("Email (no editable):"), fEmail);
        form.setPadding(new javafx.geometry.Insets(15));
        dialog.getDialogPane().setContent(form);
        dialog.getDialogPane().getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);

        dialog.showAndWait().ifPresent(bt -> {
            if (bt == ButtonType.OK) {
                int id = sel.get("idUsuario").getAsInt();
                JsonObject body = new JsonObject();
                body.addProperty("nombre", fNombre.getText().trim());
                body.addProperty("email",  getStr(sel, "email"));
                body.addProperty("idRol",  getRolId(sel));

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
        confirm.setTitle("Confirmar");
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

    private int getRolId(JsonObject obj) {
        try {
            JsonObject rol = obj.getAsJsonObject("rol");
            return rol != null ? rol.get("idRol").getAsInt() : 2;
        } catch (Exception e) { return 2; }
    }

    private boolean isActivo(JsonObject obj) {
        try { return obj.get("activo").getAsBoolean(); }
        catch (Exception e) { return true; }
    }

    private void setStatus(String msg) { lblStatusUsuarios.setText(msg); }

    private void mostrarInfo(String msg) {
        new Alert(Alert.AlertType.INFORMATION, msg, ButtonType.OK).showAndWait();
    }

    private void mostrarAviso(String msg) {
        new Alert(Alert.AlertType.WARNING, msg, ButtonType.OK).showAndWait();
    }

    private void mostrarError(String msg) {
        new Alert(Alert.AlertType.ERROR, msg, ButtonType.OK).showAndWait();
    }
}
