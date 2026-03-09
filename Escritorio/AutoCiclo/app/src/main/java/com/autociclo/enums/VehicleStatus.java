package com.autociclo.enums;

/**
 * Estados posibles de un vehículo en el desguace.
 *
 * @author Yalil Musa Talhaoui
 */
public enum VehicleStatus {
    COMPLETO("Completo"),
    DESGUAZANDO("Desguazando"),
    DESGUAZADO("Desguazado");

    private final String displayName;

    VehicleStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    @Override
    public String toString() {
        return displayName;
    }

    /**
     * Obtiene todos los valores como array de strings para ComboBox
     */
    public static String[] getDisplayNames() {
        VehicleStatus[] values = values();
        String[] names = new String[values.length];
        for (int i = 0; i < values.length; i++) {
            names[i] = values[i].displayName;
        }
        return names;
    }

    /**
     * Busca un estado por su nombre de display
     */
    public static VehicleStatus fromDisplayName(String name) {
        for (VehicleStatus status : values()) {
            if (status.displayName.equalsIgnoreCase(name)) {
                return status;
            }
        }
        return null;
    }
}
