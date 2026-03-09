package com.autociclo.utils;

import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.image.Image;
import javafx.stage.Modality;
import javafx.stage.Stage;
import javafx.stage.Window;

/**
 * Clase utilitaria para crear y mostrar ventanas modales.
 *
 * @author Yalil Musa Talhaoui
 */
public class ModalUtils {

    private static final Image APP_ICON = new Image(
            ModalUtils.class.getResourceAsStream("/imagenes/logo_autociclo.png"));

    /**
     * Carga un FXML y muestra la ventana modal
     *
     * @param fxmlPath Ruta del archivo FXML (ej: "/fxml/FormularioVehiculo.fxml")
     * @param titulo   Titulo de la ventana
     * @param owner    Ventana padre
     * @return El controlador del FXML cargado
     */
    public static <T> T mostrarModal(String fxmlPath, String titulo, Window owner) {
        return mostrarModal(fxmlPath, titulo, owner, 850, 750);
    }

    /**
     * Carga un FXML y muestra la ventana modal con dimensiones personalizadas
     */
    public static <T> T mostrarModal(String fxmlPath, String titulo, Window owner,
                                      double minWidth, double minHeight) {
        try {
            FXMLLoader loader = new FXMLLoader(ModalUtils.class.getResource(fxmlPath));
            Parent root = loader.load();

            Stage modalStage = new Stage();
            modalStage.getIcons().add(APP_ICON);
            modalStage.setTitle(titulo);
            modalStage.initModality(Modality.APPLICATION_MODAL);
            modalStage.initOwner(owner);

            Scene scene = new Scene(root);
            modalStage.setScene(scene);
            modalStage.setResizable(true);
            modalStage.setMinWidth(minWidth);
            modalStage.setMinHeight(minHeight);
            modalStage.sizeToScene();
            modalStage.showAndWait();

            return loader.getController();

        } catch (Exception e) {
            LoggerUtil.error("Error al abrir ventana modal: " + fxmlPath, e);
            ValidationUtils.showError("Error", "No se pudo abrir la ventana: " + e.getMessage());
            return null;
        }
    }

    /**
     * Carga un FXML y devuelve el loader para configurar el controlador antes de mostrar
     */
    public static FXMLLoader cargarFXML(String fxmlPath) {
        try {
            FXMLLoader loader = new FXMLLoader(ModalUtils.class.getResource(fxmlPath));
            loader.load();
            return loader;
        } catch (Exception e) {
            LoggerUtil.error("Error al cargar FXML: " + fxmlPath, e);
            return null;
        }
    }

    /**
     * Muestra una ventana modal a partir de un loader ya configurado
     */
    public static void mostrarDesdeLoader(FXMLLoader loader, String titulo, Window owner) {
        mostrarDesdeLoader(loader, titulo, owner, 850, 750);
    }

    /**
     * Muestra una ventana modal a partir de un loader ya configurado con dimensiones
     */
    public static void mostrarDesdeLoader(FXMLLoader loader, String titulo, Window owner,
                                           double minWidth, double minHeight) {
        try {
            Parent root = loader.getRoot();

            Stage modalStage = new Stage();
            modalStage.getIcons().add(APP_ICON);
            modalStage.setTitle(titulo);
            modalStage.initModality(Modality.APPLICATION_MODAL);
            modalStage.initOwner(owner);

            Scene scene = new Scene(root);
            modalStage.setScene(scene);
            modalStage.setResizable(true);
            modalStage.setMinWidth(minWidth);
            modalStage.setMinHeight(minHeight);
            modalStage.sizeToScene();
            modalStage.showAndWait();

        } catch (Exception e) {
            LoggerUtil.error("Error al mostrar ventana modal", e);
            ValidationUtils.showError("Error", "No se pudo abrir la ventana: " + e.getMessage());
        }
    }
}
