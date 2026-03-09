package com.autociclo.utils;

import javafx.scene.Node;
import javafx.scene.control.Button;
import javafx.stage.Stage;

/**
 * Utilidades para manejo de ventanas.
 *
 * @author Yalil Musa Talhaoui
 */
public final class WindowUtils {

    private WindowUtils() {} // No instanciable

    /**
     * Cierra la ventana que contiene el nodo dado
     */
    public static void closeWindow(Node node) {
        Stage stage = getStage(node);
        if (stage != null) {
            stage.close();
        }
    }

    /**
     * Cierra la ventana desde un botón (uso común)
     */
    public static void closeWindow(Button button) {
        closeWindow((Node) button);
    }

    /**
     * Obtiene el Stage que contiene el nodo
     */
    public static Stage getStage(Node node) {
        if (node != null && node.getScene() != null && node.getScene().getWindow() != null) {
            return (Stage) node.getScene().getWindow();
        }
        return null;
    }

    /**
     * Obtiene la ventana padre (owner) de un nodo
     */
    public static javafx.stage.Window getOwner(Node node) {
        if (node != null && node.getScene() != null) {
            return node.getScene().getWindow();
        }
        return null;
    }
}
