package com.autociclo.controllers;

import javafx.fxml.FXML;

/**
 * Controlador para la pantalla de carga
 * 
 * @author Yalil Musa Talhaoui
 */
public class PantallaDeCargaController implements javafx.fxml.Initializable {

    @FXML
    private javafx.scene.layout.VBox contentPane;

    @FXML
    private javafx.scene.control.ProgressIndicator progressIndicator;

    @Override
    public void initialize(java.net.URL location, java.util.ResourceBundle resources) {
        // Animación de entrada
        javafx.animation.ScaleTransition scaleTransition = new javafx.animation.ScaleTransition(
                javafx.util.Duration.millis(800), contentPane);
        scaleTransition.setFromX(0.5);
        scaleTransition.setFromY(0.5);
        scaleTransition.setToX(1.0);
        scaleTransition.setToY(1.0);
        scaleTransition.play();

        javafx.animation.FadeTransition fadeTransition = new javafx.animation.FadeTransition(
                javafx.util.Duration.millis(800), contentPane);
        fadeTransition.setFromValue(0.0);
        fadeTransition.setToValue(1.0);
        fadeTransition.play();
    }

    /**
     * Obtiene el indicador de progreso
     * 
     * @return ProgressIndicator
     */
    public javafx.scene.control.ProgressIndicator getProgressIndicator() {
        return progressIndicator;
    }
}
