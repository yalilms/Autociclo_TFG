package com.autociclo.controllers;

import com.autociclo.api.ApiClient;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.autociclo.utils.LoggerUtil;
import javafx.application.Platform;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.chart.BarChart;
import javafx.scene.chart.PieChart;
import javafx.scene.chart.XYChart;
import javafx.scene.control.ProgressIndicator;
import javafx.scene.control.ScrollPane;
import javafx.scene.layout.VBox;

import java.net.URL;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.ResourceBundle;

public class EstadisticasController implements Initializable {

    @FXML
    private BarChart<String, Integer> barChartVehiculos;

    @FXML
    private PieChart pieChartPiezas;

    @FXML
    private BarChart<String, Integer> barChartKilometraje;

    @FXML
    private VBox loadingOverlay;

    @FXML
    private ProgressIndicator progressIndicator;

    @FXML
    private ScrollPane scrollPaneContenido;

    @Override
    public void initialize(URL location, ResourceBundle resources) {
        actualizarDatos();
    }

    public void actualizarDatos() {
        if (loadingOverlay != null) {
            loadingOverlay.setVisible(true);
        }

        new Thread(() -> {
            cargarDatosVehiculos();
            cargarDatosPiezas();

            Platform.runLater(() -> {
                if (loadingOverlay != null) {
                    loadingOverlay.setVisible(false);
                }
            });
        }).start();
    }

    private void cargarDatosVehiculos() {
        ApiClient.ApiResponse resp = ApiClient.getInstance().get("/api/vehiculos");
        if (!resp.isSuccess()) {
            LoggerUtil.error("Error API al cargar estadísticas de vehículos: " + resp.getStatusCode(), null);
            return;
        }

        JsonArray arr = JsonParser.parseString(resp.getBody()).getAsJsonArray();

        // Agrupar por marca
        Map<String, Integer> porMarca = new LinkedHashMap<>();
        // Top 5 por kilometraje
        List<JsonObject> vehiculos = new ArrayList<>();

        arr.forEach(e -> {
            JsonObject v = e.getAsJsonObject();
            String marca = getStr(v, "marca");
            porMarca.merge(marca, 1, Integer::sum);
            vehiculos.add(v);
        });

        // Top 5 por kilometraje descendente
        vehiculos.sort((a, b) -> {
            int kmA = a.has("kilometraje") && !a.get("kilometraje").isJsonNull() ? a.get("kilometraje").getAsInt() : 0;
            int kmB = b.has("kilometraje") && !b.get("kilometraje").isJsonNull() ? b.get("kilometraje").getAsInt() : 0;
            return Integer.compare(kmB, kmA);
        });
        List<JsonObject> top5 = vehiculos.subList(0, Math.min(5, vehiculos.size()));

        // Series por marca
        XYChart.Series<String, Integer> seriesMarca = new XYChart.Series<>();
        seriesMarca.setName("Vehículos");
        porMarca.forEach((marca, cnt) -> seriesMarca.getData().add(new XYChart.Data<>(marca, cnt)));

        // Series por kilometraje
        XYChart.Series<String, Integer> seriesKm = new XYChart.Series<>();
        seriesKm.setName("Kilometraje");
        top5.forEach(v -> {
            String label = getStr(v, "marca") + " " + getStr(v, "modelo");
            int km = v.has("kilometraje") && !v.get("kilometraje").isJsonNull() ? v.get("kilometraje").getAsInt() : 0;
            seriesKm.getData().add(new XYChart.Data<>(label, km));
        });

        Platform.runLater(() -> {
            barChartVehiculos.getData().clear();
            barChartVehiculos.getData().add(seriesMarca);
            barChartKilometraje.getData().clear();
            barChartKilometraje.getData().add(seriesKm);
        });
    }

    private void cargarDatosPiezas() {
        ApiClient.ApiResponse resp = ApiClient.getInstance().get("/api/piezas");
        if (!resp.isSuccess()) {
            LoggerUtil.error("Error API al cargar estadísticas de piezas: " + resp.getStatusCode(), null);
            return;
        }

        JsonArray arr = JsonParser.parseString(resp.getBody()).getAsJsonArray();

        Map<String, Integer> porCategoria = new LinkedHashMap<>();
        arr.forEach(e -> {
            JsonObject p = e.getAsJsonObject();
            String cat = getStr(p, "categoria");
            porCategoria.merge(cat, 1, Integer::sum);
        });

        ObservableList<PieChart.Data> pieData = FXCollections.observableArrayList();
        porCategoria.forEach((cat, cnt) -> pieData.add(new PieChart.Data(cat, cnt)));

        Platform.runLater(() -> {
            pieChartPiezas.getData().clear();
            pieChartPiezas.setData(pieData);
        });
    }

    private String getStr(JsonObject obj, String key) {
        return obj.has(key) && !obj.get(key).isJsonNull() ? obj.get(key).getAsString() : "";
    }
}
