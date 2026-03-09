package com.autociclo.utils;

import java.sql.SQLException;

/**
 * Manejador centralizado de errores.
 *
 * @author Yalil Musa Talhaoui
 */
public final class ErrorHandler {

    private ErrorHandler() {} // No instanciable

    /**
     * Maneja errores de base de datos
     */
    public static void handleDatabaseError(SQLException e, String operation) {
        LoggerUtil.error("Error al " + operation, e);
        ValidationUtils.showError(AppConstants.MSG_DB_ERROR,
                "No se pudo " + operation + ": " + e.getMessage());
    }

    /**
     * Maneja errores de formato numérico
     */
    public static void handleNumberFormatError(String context) {
        LoggerUtil.warning("Error de formato numérico en: " + context);
        ValidationUtils.showError(AppConstants.MSG_FORMAT_ERROR,
                "Verifique que los campos numéricos tengan el formato correcto");
    }

    /**
     * Maneja errores genéricos
     */
    public static void handleError(Exception e, String operation) {
        LoggerUtil.error("Error al " + operation, e);
        ValidationUtils.showError("Error", "No se pudo " + operation + ": " + e.getMessage());
    }

    /**
     * Maneja errores de carga de FXML
     */
    public static void handleFXMLError(Exception e, String fxmlPath) {
        LoggerUtil.error("Error al cargar FXML: " + fxmlPath, e);
        ValidationUtils.showError("Error de interfaz",
                "No se pudo cargar la pantalla: " + e.getMessage());
    }

    /**
     * Maneja errores de carga de recursos
     */
    public static void handleResourceError(Exception e, String resourcePath) {
        LoggerUtil.error("Error al cargar recurso: " + resourcePath, e);
        ValidationUtils.showError("Error de recursos",
                "No se pudo cargar el recurso: " + resourcePath);
    }

    /**
     * Maneja errores de guardado
     */
    public static void handleSaveError(SQLException e, String entityType) {
        LoggerUtil.error("Error al guardar " + entityType + " en BD", e);
        ValidationUtils.showError(AppConstants.MSG_DB_ERROR,
                "No se pudo guardar el/la " + entityType + ": " + e.getMessage());
    }

    /**
     * Maneja errores de eliminación
     */
    public static void handleDeleteError(SQLException e, String entityType) {
        LoggerUtil.error("Error al eliminar " + entityType + " de BD", e);
        ValidationUtils.showError(AppConstants.MSG_DB_ERROR,
                "No se pudo eliminar: " + e.getMessage());
    }
}
