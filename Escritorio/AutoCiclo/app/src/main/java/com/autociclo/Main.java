package com.autociclo;

import com.autociclo.utils.AnimationFactory;
import com.autociclo.utils.AppConstants;
import com.autociclo.utils.AppResources;

import javafx.animation.FadeTransition;
import javafx.animation.PauseTransition;
import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.Alert;
import javafx.scene.control.ButtonType;
import javafx.scene.layout.StackPane;
import javafx.stage.Stage;

/**
 * Clase principal de la aplicación AutoCiclo.
 *
 * @author Yalil Musa Talhaoui
 */
public class Main extends Application {

    public static void main(String[] args) {
        launch(args);
    }

    @Override
    public void start(Stage primaryStage) throws Exception {
        // Configurar icono de la aplicación
        primaryStage.getIcons().add(AppResources.getIcon());

        // Cargar ambas pantallas desde el inicio
        Parent pantallaCarga = FXMLLoader.load(getClass().getResource(AppConstants.PATH_SPLASH_FXML));
        Parent listado = FXMLLoader.load(getClass().getResource(AppConstants.PATH_MAIN_FXML));
        listado.setOpacity(0.0);

        // Contenedor con ambas pantallas superpuestas
        StackPane contenedor = new StackPane(listado, pantallaCarga);

        // Configurar escena
        Scene escena = new Scene(contenedor, AppConstants.DEFAULT_WINDOW_WIDTH, AppConstants.DEFAULT_WINDOW_HEIGHT);
        primaryStage.setScene(escena);
        primaryStage.setTitle("AutoCiclo - Gestión de Desguace");
        primaryStage.setResizable(true);
        primaryStage.setMinWidth(AppConstants.MIN_WINDOW_WIDTH);
        primaryStage.setMinHeight(AppConstants.MIN_WINDOW_HEIGHT);

        primaryStage.show();
        primaryStage.centerOnScreen();

        // Configurar confirmación al cerrar
        configurarCierreVentana(primaryStage);

        // Animación de splash screen
        iniciarAnimacionSplash(contenedor, pantallaCarga, listado, primaryStage);
    }

    private void configurarCierreVentana(Stage stage) {
        stage.setOnCloseRequest(event -> {
            event.consume();

            Alert alert = new Alert(Alert.AlertType.CONFIRMATION);
            alert.setTitle("Salir de AutoCiclo");
            alert.setHeaderText("¿Está seguro que desea salir?");
            alert.setContentText("Se cerrará la aplicación AutoCiclo - Gestión de Desguace");

            alert.getDialogPane().getStylesheets().add(
                    getClass().getResource(AppConstants.PATH_STYLES_CSS).toExternalForm());
            alert.getDialogPane().getStyleClass().add("glass-pane");

            alert.setOnShowing(e -> {
                Stage alertStage = (Stage) alert.getDialogPane().getScene().getWindow();
                if (alertStage != null) {
                    alertStage.getIcons().add(AppResources.getIcon());
                }
            });

            alert.showAndWait().ifPresent(response -> {
                if (response == ButtonType.OK) {
                    stage.close();
                    System.exit(0);
                }
            });
        });
    }

    private void iniciarAnimacionSplash(StackPane contenedor, Parent pantallaCarga,
                                         Parent listado, Stage stage) {
        PauseTransition pause = AnimationFactory.createPause(AppConstants.SPLASH_DURATION_SECONDS);

        pause.setOnFinished(event -> {
            FadeTransition fadeOut = AnimationFactory.createFade(pantallaCarga, 1.0, 0.0, 500);
            FadeTransition fadeIn = AnimationFactory.createFade(listado, 0.0, 1.0, 500);

            fadeOut.setOnFinished(e -> {
                contenedor.getChildren().remove(pantallaCarga);
                stage.centerOnScreen();
            });

            fadeOut.play();
            fadeIn.play();
        });

        pause.play();
    }
}
