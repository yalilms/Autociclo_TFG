package com.autociclo.utils;

import java.util.logging.ConsoleHandler;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.logging.SimpleFormatter;

/**
 * Utilidad centralizada para logging en la aplicación
 * Reemplaza el uso de System.out.println y printStackTrace
 *
 * @author Yalil Musa Talhaoui
 */
public class LoggerUtil {

    private static final Logger LOGGER = Logger.getLogger("AutoCiclo");

    static {
        // Configurar el logger
        LOGGER.setLevel(Level.ALL);
        ConsoleHandler handler = new ConsoleHandler();
        handler.setLevel(Level.ALL);
        handler.setFormatter(new SimpleFormatter());
        LOGGER.addHandler(handler);
        LOGGER.setUseParentHandlers(false);
    }

    /**
     * Log de información general
     */
    public static void info(String mensaje) {
        LOGGER.info(mensaje);
    }

    /**
     * Log de advertencia
     */
    public static void warning(String mensaje) {
        LOGGER.warning(mensaje);
    }

    /**
     * Log de error sin excepción
     */
    public static void error(String mensaje) {
        LOGGER.severe(mensaje);
    }

    /**
     * Log de error con excepción
     */
    public static void error(String mensaje, Throwable throwable) {
        LOGGER.log(Level.SEVERE, mensaje, throwable);
    }

    /**
     * Log de depuración (solo en desarrollo)
     */
    public static void debug(String mensaje) {
        LOGGER.fine(mensaje);
    }

    /**
     * Log de datos de base de datos cargados
     */
    public static void logDatosCargados(String entidad, int cantidad) {
        LOGGER.info(String.format("%s cargados: %d registros", entidad, cantidad));
    }

    /**
     * Log de operación CRUD exitosa
     */
    public static void logOperacionExitosa(String operacion, String entidad) {
        LOGGER.info(String.format("%s %s realizado correctamente", operacion, entidad));
    }

    /**
     * Log de conexión a base de datos
     */
    public static void logConexionBD(boolean exitosa) {
        if (exitosa) {
            LOGGER.info("Conexión a base de datos establecida correctamente");
        } else {
            LOGGER.severe("Error al establecer conexión con la base de datos");
        }
    }
}
