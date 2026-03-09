package com.autociclo.utils;

import javafx.scene.control.*;
import javafx.scene.control.DialogPane;
import javafx.scene.image.Image;
import javafx.stage.Stage;

/**
 * Utilidad para validación de campos según PDF DI-TEMA 2-4
 * 
 * @author Yalil Musa Talhaoui
 */
public class ValidationUtils {

    // Estilos CSS inline
    private static final String ERROR_STYLE = "-fx-border-color: #e74c3c; -fx-border-width: 2px;";
    private static final String SUCCESS_STYLE = "-fx-border-color: #27ae60; -fx-border-width: 2px;";
    private static final String NORMAL_STYLE = "-fx-border-color: #bdc3c7; -fx-border-width: 1px;";

    /**
     * Valida que un TextField no esté vacío (isEmpty - permitido PDF página 3)
     * 
     * @param field      TextField a validar
     * @param errorLabel Label donde mostrar el mensaje de error
     * @param fieldName  Nombre del campo para el mensaje
     * @return true si es válido, false si está vacío
     */
    public static boolean validateNotEmpty(TextField field, Label errorLabel, String fieldName) {
        String value = field.getText().trim();

        // isEmpty
        if (value.isEmpty()) {
            showError(field, errorLabel, fieldName + " es obligatorio");
            return false;
        }

        showSuccess(field, errorLabel);
        return true;
    }

    /**
     * Valida que un ComboBox tenga una selección (valor null)
     */
    public static boolean validateComboBox(ComboBox<?> comboBox, Label errorLabel, String fieldName) {
        // Valores nulos permitidos
        if (comboBox.getValue() == null) {
            showError(comboBox, errorLabel, "Debe seleccionar " + fieldName);
            return false;
        }

        showSuccess(comboBox, errorLabel);
        return true;
    }

    /**
     * Valida que un TextArea no esté vacío (isEmpty)
     */
    public static boolean validateTextArea(TextArea area, Label errorLabel, String fieldName) {
        String value = area.getText().trim();

        if (value.isEmpty()) {
            showError(area, errorLabel, fieldName + " es obligatorio");
            return false;
        }

        showSuccess(area, errorLabel);
        return true;
    }

    /**
     * Valida formato de matrícula española (expresiones regulares)
     */
    public static boolean validateMatricula(TextField field, Label errorLabel) {
        String value = field.getText().trim().toUpperCase();

        if (value.isEmpty()) {
            showError(field, errorLabel, "La matrícula es obligatoria");
            return false;
        }

        // matches() con expresión regular
        if (!value.matches("^\\d{4}[A-Z]{3}$")) {
            showError(field, errorLabel, "Formato inválido. Use: 1234ABC");
            return false;
        }

        field.setText(value);
        showSuccess(field, errorLabel);
        return true;
    }

    /**
     * Valida que un campo sea numérico entero
     * Usa Excepciones
     */
    public static boolean validateInteger(TextField field, Label errorLabel, String fieldName) {
        String value = field.getText().trim();

        if (value.isEmpty()) {
            showError(field, errorLabel, fieldName + " es obligatorio");
            return false;
        }

        // Validación mediante Excepciones
        try {
            Integer.parseInt(value);
            showSuccess(field, errorLabel);
            return true;
        } catch (NumberFormatException e) {
            showError(field, errorLabel, fieldName + " debe ser un número entero");
            return false;
        }
    }

    /**
     * Valida que un campo sea numérico entero y esté en un rango
     */
    public static boolean validateIntegerRange(TextField field, Label errorLabel, String fieldName, int min, int max) {
        String value = field.getText().trim();

        if (value.isEmpty()) {
            showError(field, errorLabel, fieldName + " es obligatorio");
            return false;
        }

        try {
            int numero = Integer.parseInt(value);

            // Rangos numéricos
            if (numero < min || numero > max) {
                showError(field, errorLabel, fieldName + " debe estar entre " + min + " y " + max);
                return false;
            }

            showSuccess(field, errorLabel);
            return true;
        } catch (NumberFormatException e) {
            showError(field, errorLabel, fieldName + " debe ser un número entero");
            return false;
        }
    }

    /**
     * Valida que un campo sea numérico decimal
     * Usa Excepciones
     */
    public static boolean validateDouble(TextField field, Label errorLabel, String fieldName) {
        String value = field.getText().trim().replace(",", ".");

        if (value.isEmpty()) {
            showError(field, errorLabel, fieldName + " es obligatorio");
            return false;
        }

        try {
            Double.parseDouble(value);
            field.setText(value);
            showSuccess(field, errorLabel);
            return true;
        } catch (NumberFormatException e) {
            showError(field, errorLabel, fieldName + " debe ser un número decimal");
            return false;
        }
    }

    /**
     * Valida que un campo sea numérico decimal y mayor o igual a un mínimo
     * Rangos numéricos
     */
    public static boolean validateDoubleMinimum(TextField field, Label errorLabel, String fieldName, double min) {
        String value = field.getText().trim().replace(",", ".");

        if (value.isEmpty()) {
            showError(field, errorLabel, fieldName + " es obligatorio");
            return false;
        }

        try {
            double numero = Double.parseDouble(value);

            if (numero < min) {
                showError(field, errorLabel, fieldName + " debe ser mayor o igual a " + min);
                return false;
            }

            field.setText(value);
            showSuccess(field, errorLabel);
            return true;
        } catch (NumberFormatException e) {
            showError(field, errorLabel, fieldName + " debe ser un número decimal");
            return false;
        }
    }

    /**
     * Valida que un Spinner tenga un valor válido (valores null)
     */
    public static boolean validateSpinner(Spinner<?> spinner, Label errorLabel, String fieldName) {
        if (spinner.getValue() == null) {
            showError(spinner, errorLabel, fieldName + " es obligatorio");
            return false;
        }

        showSuccess(spinner, errorLabel);
        return true;
    }

    /**
     * Muestra error visual en el campo
     * Usa setStyle() con CSS inline
     */
    private static void showError(Control field, Label errorLabel, String message) {
        // CSS inline permitido en Sección 4 del PDF
        field.setStyle(ERROR_STYLE);

        if (errorLabel != null) {
            errorLabel.setText("⚠ " + message);
            errorLabel.setStyle("-fx-text-fill: #e74c3c;");
            errorLabel.setVisible(true);
        }
    }

    /**
     * Muestra éxito visual en el campo
     * Usa setStyle() con CSS inline
     */
    private static void showSuccess(Control field, Label errorLabel) {
        field.setStyle(SUCCESS_STYLE);

        if (errorLabel != null) {
            errorLabel.setText("");
            errorLabel.setVisible(false);
        }
    }

    /**
     * Resetea el estilo del campo a normal
     */
    public static void resetStyle(Control field, Label errorLabel) {
        field.setStyle(NORMAL_STYLE);

        if (errorLabel != null) {
            errorLabel.setText("");
            errorLabel.setVisible(false);
        }
    }

    // Icono de la aplicación cargado una sola vez
    private static final Image APP_ICON = new Image(
            ValidationUtils.class.getResourceAsStream("/imagenes/logo_autociclo.png"));

    /**
     * Aplica el estilo personalizado de AutoCiclo a un Alert
     * Incluye icono de la aplicación en la ventana del Alert
     */
    private static void applyCustomStyle(Alert alert) {
        // Aplicar la hoja de estilos CSS de la aplicación
        DialogPane dialogPane = alert.getDialogPane();
        dialogPane.getStylesheets().add(
                ValidationUtils.class.getResource("/css/styles.css").toExternalForm());
        dialogPane.getStyleClass().add("glass-pane");

        // Añadir icono usando Platform.runLater para asegurar ejecución en FX Thread
        alert.setOnShowing(event -> {
            javafx.application.Platform.runLater(() -> {
                Stage stage = (Stage) alert.getDialogPane().getScene().getWindow();
                if (stage != null && stage.getIcons().isEmpty()) {
                    stage.getIcons().add(APP_ICON);
                }
            });
        });
    }

    /**
     * Muestra un mensaje de alerta de error
     * Alert permitido (es parte estándar de JavaFX)
     */
    public static void showAlert(String title, String header, String content, Alert.AlertType type) {
        Alert alert = new Alert(type);
        alert.setTitle(title);
        alert.setHeaderText(header);
        alert.setContentText(content);
        applyCustomStyle(alert);
        alert.showAndWait();
    }

    /**
     * Muestra un diálogo de confirmación
     * 
     * @return true si el usuario confirma, false si cancela
     */
    public static boolean showConfirmation(String title, String header, String content) {
        Alert alert = new Alert(Alert.AlertType.CONFIRMATION);
        alert.setTitle(title);
        alert.setHeaderText(header);
        alert.setContentText(content);
        applyCustomStyle(alert);

        return alert.showAndWait().orElse(ButtonType.CANCEL) == ButtonType.OK;
    }

    /**
     * Muestra un mensaje de éxito
     */
    public static void showSuccess(String title, String message) {
        Alert alert = new Alert(Alert.AlertType.INFORMATION);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(message);
        applyCustomStyle(alert);
        alert.showAndWait();
    }

    /**
     * Muestra un mensaje de error
     */
    public static void showError(String title, String message) {
        Alert alert = new Alert(Alert.AlertType.ERROR);
        alert.setTitle("Error");
        alert.setHeaderText(title);
        alert.setContentText(message);
        applyCustomStyle(alert);
        alert.showAndWait();
    }

    /**
     * Valida que un código de pieza no esté vacío y tenga formato alfanumérico
     * Usa matches() con expresión regular
     */
    public static boolean validateCodigoPieza(TextField field, Label errorLabel) {
        String value = field.getText().trim().toUpperCase();

        if (value.isEmpty()) {
            showError(field, errorLabel, "El código de pieza es obligatorio");
            return false;
        }

        // matches() con expresión regular
        if (!value.matches("^[A-Z0-9\\-]+$")) {
            showError(field, errorLabel, "Solo letras, números y guión (-) permitidos");
            return false;
        }

        field.setText(value);
        showSuccess(field, errorLabel);
        return true;
    }

    /**
     * Limpia todos los estilos de validación de múltiples campos
     */
    public static void clearAllValidations(Control... fields) {
        for (Control field : fields) {
            resetStyle(field, null);
        }
    }

    /**
     * Valida que un campo sea un entero >= 0 (para stock, kilometraje, etc.)
     * Campo opcional: si está vacío se considera válido
     */
    public static boolean validateNonNegativeInteger(TextField field, Label errorLabel, String fieldName) {
        String value = field.getText().trim();

        if (value.isEmpty()) {
            showSuccess(field, errorLabel);
            return true;
        }

        try {
            int numero = Integer.parseInt(value);
            if (numero < 0) {
                showError(field, errorLabel, fieldName + " debe ser un número positivo");
                return false;
            }
            showSuccess(field, errorLabel);
            return true;
        } catch (NumberFormatException e) {
            showError(field, errorLabel, fieldName + " debe ser un número entero válido");
            return false;
        }
    }

    /**
     * Valida un entero >= 0 y devuelve el valor o un valor por defecto
     */
    public static int parseNonNegativeIntOrDefault(String text, int defaultValue) {
        if (text == null || text.trim().isEmpty()) {
            return defaultValue;
        }
        try {
            int value = Integer.parseInt(text.trim());
            return value >= 0 ? value : defaultValue;
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    /**
     * Valida un double y devuelve el valor o un valor por defecto
     */
    public static double parseDoubleOrDefault(String text, double defaultValue) {
        if (text == null || text.trim().isEmpty()) {
            return defaultValue;
        }
        try {
            return Double.parseDouble(text.trim().replace(",", "."));
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }
}
