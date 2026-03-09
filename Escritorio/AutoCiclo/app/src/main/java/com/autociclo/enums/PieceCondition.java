package com.autociclo.enums;

/**
 * Condición/estado de una pieza extraída.
 *
 * @author Yalil Musa Talhaoui
 */
public enum PieceCondition {
    NUEVA("nueva", "Nueva"),
    USADA("usada", "Usada"),
    REPARADA("reparada", "Reparada");

    private final String code;
    private final String displayName;

    PieceCondition(String code, String displayName) {
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
     * Obtiene todos los códigos como array
     */
    public static String[] getCodes() {
        PieceCondition[] values = values();
        String[] codes = new String[values.length];
        for (int i = 0; i < values.length; i++) {
            codes[i] = values[i].code;
        }
        return codes;
    }

    /**
     * Busca una condición por su código
     */
    public static PieceCondition fromCode(String code) {
        for (PieceCondition cond : values()) {
            if (cond.code.equalsIgnoreCase(code)) {
                return cond;
            }
        }
        return null;
    }
}
