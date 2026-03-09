package com.autociclo.enums;

/**
 * Categorías de piezas disponibles.
 *
 * @author Yalil Musa Talhaoui
 */
public enum PieceCategory {
    MOTOR("motor", "Motor"),
    CARROCERIA("carroceria", "Carrocería"),
    INTERIOR("interior", "Interior"),
    ELECTRONICA("electronica", "Electrónica"),
    RUEDAS("ruedas", "Ruedas"),
    OTROS("otros", "Otros");

    private final String code;
    private final String displayName;

    PieceCategory(String code, String displayName) {
        this.code = code;
        this.displayName = displayName;
    }

    public String getCode() {
        return code;
    }

    public String getDisplayName() {
        return displayName;
    }

    @Override
    public String toString() {
        return code;
    }

    /**
     * Obtiene todos los códigos como array para ComboBox
     */
    public static String[] getCodes() {
        PieceCategory[] values = values();
        String[] codes = new String[values.length];
        for (int i = 0; i < values.length; i++) {
            codes[i] = values[i].code;
        }
        return codes;
    }

    /**
     * Busca una categoría por su código
     */
    public static PieceCategory fromCode(String code) {
        for (PieceCategory cat : values()) {
            if (cat.code.equalsIgnoreCase(code)) {
                return cat;
            }
        }
        return null;
    }
}
