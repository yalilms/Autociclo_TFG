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
import javafx.scene.input.KeyCode;
import javafx.stage.Stage;

import java.net.URL;
import java.util.ResourceBundle;

/**
 * Controlador de la pantalla de inicio de sesión.
 * Llama a POST /api/auth/login y, si tiene éxito, abre la ventana principal.
 *
 * @author Yalil Musa Talhaoui
 */
public class LoginController implements Initializable {

    @FXML private TextField txtEmail;
    @FXML private PasswordField txtPassword;
    @FXML private Button btnAcceder;
    @FXML private Label lblError;

    @Override
    public void initialize(URL url, ResourceBundle rb) {
        // Enter en el campo de contraseña también lanza el login
        txtPassword.setOnKeyPressed(event -> {
            if (event.getCode() == KeyCode.ENTER) handleLogin();
        });
    }

    @FXML
    private void handleLogin() {
        String email    = txtEmail.getText().trim();
        String password = txtPassword.getText();

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
