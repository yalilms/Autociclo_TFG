package com.autociclo.utils;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * Clase utilitaria para cargar ubicaciones desde el archivo JSON.
 * Centraliza la carga de ubicaciones de vehiculos y piezas.
 *
 * @author Yalil Musa Talhaoui
 */
public class UbicacionesJsonLoader {

    private static JsonObject ubicacionesData = null;

    private static JsonObject cargarUbicaciones() {
        if (ubicacionesData != null) {
            return ubicacionesData;
        }

        try {
            InputStream is = UbicacionesJsonLoader.class.getResourceAsStream("/ubicaciones.json");
            if (is != null) {
                ubicacionesData = JsonParser.parseReader(
                        new InputStreamReader(is, StandardCharsets.UTF_8)).getAsJsonObject();
                LoggerUtil.info("Ubicaciones cargadas correctamente");
            }
        } catch (Exception e) {
            LoggerUtil.error("Error al cargar ubicaciones.json", e);
        }

        return ubicacionesData;
    }

    public static List<String> obtenerUbicacionesVehiculos() {
        return obtenerUbicaciones("vehiculos");
    }

    public static List<String> obtenerUbicacionesPiezas() {
        return obtenerUbicaciones("piezas");
    }

    private static List<String> obtenerUbicaciones(String tipo) {
        List<String> resultado = new ArrayList<>();
        JsonObject data = cargarUbicaciones();

        if (data != null && data.has(tipo)) {
            JsonArray ubicaciones = data.getAsJsonArray(tipo);
            for (int i = 0; i < ubicaciones.size(); i++) {
                resultado.add(ubicaciones.get(i).getAsString());
            }
        }

        return resultado;
    }
}
