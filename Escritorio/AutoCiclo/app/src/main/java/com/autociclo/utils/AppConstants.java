package com.autociclo.utils;

/**
 * Constantes globales de la aplicación AutoCiclo.
 * Centraliza valores hardcodeados para facilitar mantenimiento.
 *
 * @author Yalil Musa Talhaoui
 */
public final class AppConstants {

    private AppConstants() {} // No instanciable

    // ==================== DIMENSIONES DE VENTANAS ====================
    public static final int DEFAULT_WINDOW_WIDTH = 1150;
    public static final int DEFAULT_WINDOW_HEIGHT = 750;
    public static final int MIN_WINDOW_WIDTH = 900;
    public static final int MIN_WINDOW_HEIGHT = 600;
    public static final int MODAL_MIN_WIDTH = 850;
    public static final int MODAL_MIN_HEIGHT = 750;
    public static final int ABOUT_WINDOW_WIDTH = 750;
    public static final int ABOUT_WINDOW_HEIGHT = 650;

    // ==================== PAGINACIÓN ====================
    public static final int ITEMS_PER_PAGE = 10;

    // ==================== VALIDACIÓN DE AÑOS ====================
    public static final int MIN_VEHICLE_YEAR = 1900;
    public static final int MAX_VEHICLE_YEAR = 2030;

    // ==================== DURACIONES DE ANIMACIÓN (ms) ====================
    public static final double SPLASH_DURATION_SECONDS = 2.5;
    public static final double FADE_DURATION_MS = 200;
    public static final double FADE_FAST_MS = 150;
    public static final double SCALE_DURATION_MS = 150;

    // ==================== COLORES CSS ====================
    public static final String COLOR_ERROR = "#e74c3c";
    public static final String COLOR_SUCCESS = "#27ae60";
    public static final String COLOR_BORDER_NORMAL = "#bdc3c7";

    // ==================== ESTILOS CSS INLINE ====================
    public static final String STYLE_ERROR = "-fx-border-color: " + COLOR_ERROR + "; -fx-border-width: 2px;";
    public static final String STYLE_SUCCESS = "-fx-border-color: " + COLOR_SUCCESS + "; -fx-border-width: 2px;";
    public static final String STYLE_NORMAL = "-fx-border-color: " + COLOR_BORDER_NORMAL + "; -fx-border-width: 1px;";

    // ==================== RUTAS DE RECURSOS ====================
    public static final String PATH_APP_ICON = "/imagenes/logo_autociclo.png";
    public static final String PATH_SPLASH_FXML = "/fxml/PantallaDeCarga.fxml";
    public static final String PATH_MAIN_FXML = "/fxml/ListadosController.fxml";
    public static final String PATH_STYLES_CSS = "/css/styles.css";

    // ==================== RUTAS FXML DE FORMULARIOS ====================
    public static final String FXML_FORM_VEHICULO = "/fxml/FormularioVehiculo.fxml";
    public static final String FXML_FORM_PIEZA = "/fxml/FormularioPieza.fxml";
    public static final String FXML_FORM_INVENTARIO = "/fxml/AsignarPiezaVehiculo.fxml";
    public static final String FXML_DETAIL_VEHICULO = "/fxml/DetalleVehiculo.fxml";
    public static final String FXML_DETAIL_PIEZA = "/fxml/DetallePieza.fxml";
    public static final String FXML_DETAIL_INVENTARIO = "/fxml/DetalleInventario.fxml";
    public static final String FXML_ESTADISTICAS = "/fxml/Estadisticas.fxml";
    public static final String FXML_INFORMES = "/fxml/Informes.fxml";
    public static final String FXML_ABOUT = "/fxml/AcercaDe.fxml";

    // ==================== TAMAÑOS DE ICONOS ====================
    public static final int ICON_SIZE_TOOLBAR = 16;
    public static final int ICON_SIZE_NAV = 18;

    // ==================== MENSAJES ====================
    public static final String MSG_SELECTION_REQUIRED = "Selección requerida";
    public static final String MSG_DB_ERROR = "Error de base de datos";
    public static final String MSG_FORMAT_ERROR = "Error de formato";
}
