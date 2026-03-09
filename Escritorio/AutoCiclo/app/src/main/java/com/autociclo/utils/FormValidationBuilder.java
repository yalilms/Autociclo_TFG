package com.autociclo.utils;

import javafx.scene.control.Alert;
import javafx.scene.control.ComboBox;
import javafx.scene.control.TextField;

import java.util.ArrayList;
import java.util.List;

/**
 * Builder para validación de formularios con patrón fluent.
 *
 * Ejemplo de uso:
 * <pre>
 * boolean valido = new FormValidationBuilder()
 *     .validateNotEmpty(txtNombre, "Nombre")
 *     .validateMatricula(txtMatricula)
 *     .validateComboBox(cmbEstado, "un estado")
 *     .validateIntegerRange(txtAnio, "Año", 1900, 2030)
 *     .showErrorsIfInvalid();
 * </pre>
 *
 * @author Yalil Musa Talhaoui
 */
public class FormValidationBuilder {

    private final List<String> errors = new ArrayList<>();
    private boolean valid = true;

    /**
     * Valida que un campo de texto no esté vacío
     */
    public FormValidationBuilder validateNotEmpty(TextField field, String fieldName) {
        if (!ValidationUtils.validateNotEmpty(field, null, fieldName)) {
            errors.add(fieldName + ": Campo obligatorio");
            valid = false;
        }
        return this;
    }

    /**
     * Valida formato de matrícula española
     */
    public FormValidationBuilder validateMatricula(TextField field) {
        if (!ValidationUtils.validateMatricula(field, null)) {
            errors.add("Matrícula: Debe tener formato 1234ABC");
            valid = false;
        }
        return this;
    }

    /**
     * Valida código de pieza
     */
    public FormValidationBuilder validateCodigoPieza(TextField field) {
        if (!ValidationUtils.validateCodigoPieza(field, null)) {
            errors.add("Código: Debe ser alfanumérico (letras, números y guión)");
            valid = false;
        }
        return this;
    }

    /**
     * Valida que un ComboBox tenga selección
     */
    public FormValidationBuilder validateComboBox(ComboBox<?> comboBox, String fieldName) {
        if (!ValidationUtils.validateComboBox(comboBox, null, fieldName)) {
            errors.add("Debe seleccionar " + fieldName);
            valid = false;
        }
        return this;
    }

    /**
     * Valida ComboBox con estilo visual
     */
    public FormValidationBuilder validateComboBoxWithStyle(ComboBox<?> comboBox, String fieldName) {
        if (comboBox.getValue() == null || comboBox.getValue().toString().isEmpty()) {
            comboBox.setStyle(AppConstants.STYLE_ERROR);
            errors.add("Debe seleccionar " + fieldName);
            valid = false;
        } else {
            comboBox.setStyle(AppConstants.STYLE_SUCCESS);
        }
        return this;
    }

    /**
     * Valida entero en rango
     */
    public FormValidationBuilder validateIntegerRange(TextField field, String fieldName, int min, int max) {
        if (!ValidationUtils.validateIntegerRange(field, null, fieldName, min, max)) {
            errors.add(fieldName + ": Debe estar entre " + min + " y " + max);
            valid = false;
        }
        return this;
    }

    /**
     * Valida entero no negativo (opcional - vacío es válido)
     */
    public FormValidationBuilder validateNonNegativeInteger(TextField field, String fieldName) {
        if (!ValidationUtils.validateNonNegativeInteger(field, null, fieldName)) {
            errors.add(fieldName + ": Debe ser un número entero positivo");
            valid = false;
        }
        return this;
    }

    /**
     * Valida decimal con mínimo
     */
    public FormValidationBuilder validateDoubleMinimum(TextField field, String fieldName, double min) {
        if (!ValidationUtils.validateDoubleMinimum(field, null, fieldName, min)) {
            errors.add(fieldName + ": Debe ser un número mayor o igual a " + min);
            valid = false;
        }
        return this;
    }

    /**
     * Añade un error personalizado
     */
    public FormValidationBuilder addError(String errorMessage) {
        errors.add(errorMessage);
        valid = false;
        return this;
    }

    /**
     * Añade una validación personalizada
     */
    public FormValidationBuilder validateCustom(boolean condition, String errorMessage) {
        if (!condition) {
            errors.add(errorMessage);
            valid = false;
        }
        return this;
    }

    /**
     * Retorna si la validación es exitosa
     */
    public boolean isValid() {
        return valid;
    }

    /**
     * Obtiene la lista de errores
     */
    public List<String> getErrors() {
        return errors;
    }

    /**
     * Muestra errores si hay alguno y retorna si es válido
     */
    public boolean showErrorsIfInvalid() {
        if (!valid && !errors.isEmpty()) {
            StringBuilder sb = new StringBuilder();
            for (String error : errors) {
                sb.append("• ").append(error).append("\n");
            }
            ValidationUtils.showAlert("Errores de validación",
                    "Por favor, corrija los siguientes errores:",
                    sb.toString(),
                    Alert.AlertType.ERROR);
        }
        return valid;
    }

    /**
     * Resetea el builder para reutilizarlo
     */
    public FormValidationBuilder reset() {
        errors.clear();
        valid = true;
        return this;
    }
}
