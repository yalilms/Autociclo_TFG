package com.autociclo.controllers;

import com.autociclo.api.ApiClient;
import com.autociclo.api.SessionManager;
import com.autociclo.utils.AppConstants;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.fxml.Initializable;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.PasswordField;
import javafx.scene.control.TextField;
import javafx.scene.image.ImageView;
import javafx.scene.input.KeyCode;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.stage.Stage;
import org.kordamp.ikonli.javafx.FontIcon;

import java.net.URL;
import java.util.ResourceBundle;

/**
 * Controlador de la pantalla de inicio de sesión.
 * Llama a POST /api/auth/login y, si tiene éxito, abre la ventana principal.
 *
 * @author Yalil Musa Talhaoui
 */
public class LoginController implements Initializable {

    @FXML private ImageView logoImg;
    @FXML private TextField txtEmail;
    @FXML private PasswordField txtPassword;
    @FXML private TextField txtPasswordVisible;
    @FXML private Button btnVerPass;
    @FXML private FontIcon iconoOjo;
    @FXML private Button btnAcceder;
    @FXML private Label lblError;

    private boolean passwordVisible = false;

    @Override
    public void initialize(URL url, ResourceBundle rb) {
        Circle clip = new Circle(36, 36, 36);
        logoImg.setClip(clip);

        txtPassword.setOnKeyPressed(event -> {
            if (event.getCode() == KeyCode.ENTER) handleLogin();
        });
        txtPasswordVisible.setOnKeyPressed(event -> {
            if (event.getCode() == KeyCode.ENTER) handleLogin();
        });
    }

    @FXML
    private void togglePassword() {
        passwordVisible = !passwordVisible;
        if (passwordVisible) {
            txtPasswordVisible.setText(txtPassword.getText());
            txtPassword.setVisible(false);
            txtPassword.setManaged(false);
            txtPasswordVisible.setVisible(true);
            txtPasswordVisible.setManaged(true);
            txtPasswordVisible.requestFocus();
            iconoOjo.setIconLiteral("mdi2e-eye");
            iconoOjo.setIconColor(Color.web("#3b82f6"));
        } else {
            txtPassword.setText(txtPasswordVisible.getText());
            txtPasswordVisible.setVisible(false);
            txtPasswordVisible.setManaged(false);
            txtPassword.setVisible(true);
            txtPassword.setManaged(true);
            txtPassword.requestFocus();
            iconoOjo.setIconLiteral("mdi2e-eye-off");
            iconoOjo.setIconColor(Color.web("#94a3b8"));
        }
    }

    @FXML
    private void handleLogin() {
        String email    = txtEmail.getText().trim();
        String password = passwordVisible ? txtPasswordVisible.getText() : txtPassword.getText();

        if (email.isEmpty() || password.isEmpty()) {
            mostrarError("Por favor, introduce tu correo y contraseña.");
            return;
        }

        // Deshabilitar botón mientras se procesa
        btnAcceder.setDisable(true);
        btnAcceder.setText("Comprobando...");
        lblError.setVisible(false);

        // Llamada en hilo secundario para no bloquear el UI
        new Thread(() -> {
            try {
                JsonObject body = new JsonObject();
                body.addProperty("email", email);
                body.addProperty("password", password);

                ApiClient.ApiResponse response = ApiClient.getInstance().post("/api/auth/login", body);

                Platform.runLater(() -> {
                    btnAcceder.setDisable(false);
                    btnAcceder.setText("Acceder");

                    if (response.isSuccess()) {
                        JsonObject json = JsonParser.parseString(response.getBody()).getAsJsonObject();
                        if (!json.has("token") || !json.has("nombre") || !json.has("rol")
                                || json.get("token").isJsonNull()) {
                            mostrarError("Respuesta inesperada del servidor. Inténtalo de nuevo.");
                            return;
                        }
                        String token  = json.get("token").getAsString();
                        String nombre = json.get("nombre").getAsString();
                        String rol    = json.get("rol").getAsString();

                        // El Desktop es solo para ADMIN y EMPLEADO
                        if ("CLIENTE".equals(rol)) {
                            mostrarError("Acceso denegado. Esta aplicación es solo para empleados.");
                            txtPassword.clear();
                            return;
                        }

                        SessionManager.getInstance().iniciarSesion(token, email, nombre, rol);
                        abrirPantallaPrincipal();
                    } else {
                        mostrarError("Credenciales incorrectas. Inténtalo de nuevo.");
                        txtPassword.clear();
                        txtPassword.requestFocus();
                    }
                });
            } catch (Exception e) {
                Platform.runLater(() -> {
                    btnAcceder.setDisable(false);
                    btnAcceder.setText("Acceder");
                    mostrarError("No se puede conectar con el servidor. Verifica que la API está en marcha.");
                });
            }
        }).start();
    }

    private void abrirPantallaPrincipal() {
        try {
            Parent mainRoot = FXMLLoader.load(getClass().getResource(AppConstants.PATH_MAIN_FXML));

            Stage stage = (Stage) btnAcceder.getScene().getWindow();
            Scene escena = new Scene(mainRoot, AppConstants.DEFAULT_WINDOW_WIDTH, AppConstants.DEFAULT_WINDOW_HEIGHT);
            stage.setScene(escena);
            stage.centerOnScreen();
        } catch (Exception e) {
            mostrarError("Error al cargar la pantalla principal: " + e.getMessage());
        }
    }

    private void mostrarError(String mensaje) {
        lblError.setText(mensaje);
        lblError.setVisible(true);
    }
}
