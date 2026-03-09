package com.autociclo.utils;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.lang.reflect.Type;
import java.util.*;

/**
 * Clase utilitaria para cargar las marcas y modelos de vehículos desde el archivo JSON
 *
 * @author Yalil Musa Talhaoui
 * @version 1.0
 */
public class VehiculosJsonLoader {

    private static Map<String, List<String>> vehiculosData = null;

    /**
     * Carga los datos del archivo vehiculos.json
     * @return Mapa con las marcas como claves y listas de modelos como valores
     */
    public static Map<String, List<String>> cargarVehiculos() {
        if (vehiculosData != null) {
            return vehiculosData;
        }

        try {
            // Cargar el archivo JSON desde resources
            InputStream inputStream = VehiculosJsonLoader.class.getResourceAsStream("/vehiculos.json");

            if (inputStream == null) {
                LoggerUtil.error("No se pudo encontrar el archivo vehiculos.json", null);
                return new HashMap<>();
            }

            // Usar Gson para parsear el JSON
            Gson gson = new Gson();
            Type type = new TypeToken<Map<String, List<String>>>(){}.getType();
            vehiculosData = gson.fromJson(new InputStreamReader(inputStream), type);

            LoggerUtil.info("Datos de vehículos cargados correctamente: " + vehiculosData.size() + " marcas");

            return vehiculosData;

        } catch (Exception e) {
            LoggerUtil.error("Error al cargar vehiculos.json", e);
            return new HashMap<>();
        }
    }

    /**
     * Obtiene la lista de todas las marcas ordenadas alfabéticamente
     * @return Lista de marcas
     */
    public static List<String> obtenerMarcas() {
        Map<String, List<String>> data = cargarVehiculos();
        List<String> marcas = new ArrayList<>(data.keySet());
        Collections.sort(marcas);
        return marcas;
    }

    /**
     * Obtiene la lista de modelos para una marca específica
     * @param marca La marca del vehículo
     * @return Lista de modelos o lista vacía si no existe la marca
     */
    public static List<String> obtenerModelos(String marca) {
        Map<String, List<String>> data = cargarVehiculos();
        return data.getOrDefault(marca, new ArrayList<>());
    }

    /**
     * Verifica si una marca existe en el JSON
     * @param marca La marca a verificar
     * @return true si existe, false en caso contrario
     */
    public static boolean existeMarca(String marca) {
        Map<String, List<String>> data = cargarVehiculos();
        return data.containsKey(marca);
    }

    /**
     * Verifica si un modelo existe para una marca específica
     * @param marca La marca del vehículo
     * @param modelo El modelo a verificar
     * @return true si existe, false en caso contrario
     */
    public static boolean existeModelo(String marca, String modelo) {
        List<String> modelos = obtenerModelos(marca);
        return modelos.contains(modelo);
    }
}
