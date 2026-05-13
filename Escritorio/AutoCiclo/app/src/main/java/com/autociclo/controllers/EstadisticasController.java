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
import javafx.scene.control.Label;
import javafx.scene.control.ProgressIndicator;
import javafx.scene.control.ScrollPane;
import javafx.scene.layout.VBox;

import java.net.URL;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.ResourceBundle;

public class EstadisticasController implements Initializable {

    @FXML private BarChart<String, Integer> barChartVehiculos;
    @FXML private PieChart pieChartPiezas;
    @FXML private PieChart pieChartEstadoVehiculos;
    @FXML private BarChart<String, Integer> barChartSolicitudes;
    @FXML private BarChart<String, Integer> barChartKilometraje;
    @FXML private Label lblTotalVehiculos;
    @FXML private Label lblTotalPiezas;
    @FXML private Label lblSolicitudesPendientes;
    @FXML private Label lblIngresos;
    @FXML private VBox loadingOverlay;
    @FXML private ProgressIndicator progressIndicator;
    @FXML private ScrollPane scrollPaneContenido;

    @Override
    public void initialize(URL location, ResourceBundle resources) {
        Platform.runLater(() -> Platform.runLater(this::actualizarDatos));
    }

    public void actualizarDatos() {
        if (loadingOverlay != null) loadingOverlay.setVisible(true);

        new Thread(() -> {
            cargarDatosVehiculos();
            cargarDatosPiezas();
            cargarDatosSolicitudes();
            Platform.runLater(() -> {
                if (loadingOverlay != null) loadingOverlay.setVisible(false);
            });
        }).start();
    }

    private void cargarDatosVehiculos() {
        ApiClient.ApiResponse resp = ApiClient.getInstance().get("/api/vehiculos");
        if (!resp.isSuccess()) {
            LoggerUtil.error("Error API vehículos: " + resp.getStatusCode(), null);
            return;
        }

        JsonArray arr = JsonParser.parseString(resp.getBody()).getAsJsonArray();

        Map<String, Integer> porMarca  = new LinkedHashMap<>();
        Map<String, Integer> porEstado = new LinkedHashMap<>();
        List<JsonObject> vehiculos     = new ArrayList<>();

        arr.forEach(e -> {
            JsonObject v = e.getAsJsonObject();
            porMarca.merge(getStr(v, "marca"), 1, Integer::sum);
            porEstado.merge(getStr(v, "estado"), 1, Integer::sum);
            vehiculos.add(v);
        });

        vehiculos.sort((a, b) -> {
            int kmA = a.has("kilometraje") && !a.get("kilometraje").isJsonNull() ? a.get("kilometraje").getAsInt() : 0;
            int kmB = b.has("kilometraje") && !b.get("kilometraje").isJsonNull() ? b.get("kilometraje").getAsInt() : 0;
            return Integer.compare(kmB, kmA);
        });
        List<JsonObject> top5 = vehiculos.subList(0, Math.min(5, vehiculos.size()));

        XYChart.Series<String, Integer> seriesMarca = new XYChart.Series<>();
        seriesMarca.setName("Vehículos");
        porMarca.forEach((m, c) -> seriesMarca.getData().add(new XYChart.Data<>(m, c)));

        XYChart.Series<String, Integer> seriesKm = new XYChart.Series<>();
        seriesKm.setName("Kilometraje");
        top5.forEach(v -> {
            String label = getStr(v, "marca") + " " + getStr(v, "modelo");
            int km = v.has("kilometraje") && !v.get("kilometraje").isJsonNull() ? v.get("kilometraje").getAsInt() : 0;
            seriesKm.getData().add(new XYChart.Data<>(label, km));
        });

        ObservableList<PieChart.Data> estadoData = FXCollections.observableArrayList();
        porEstado.forEach((est, cnt) -> estadoData.add(new PieChart.Data(traducirEstadoVehiculo(est), cnt)));

        int total = arr.size();

        Platform.runLater(() -> {
            lblTotalVehiculos.setText(String.valueOf(total));

            barChartVehiculos.getData().clear();
            barChartVehiculos.getData().add(seriesMarca);
            barChartVehiculos.applyCss();
            barChartVehiculos.layout();

            barChartKilometraje.getData().clear();
            barChartKilometraje.getData().add(seriesKm);
            barChartKilometraje.applyCss();
            barChartKilometraje.layout();

            pieChartEstadoVehiculos.getData().clear();
            pieChartEstadoVehiculos.setData(estadoData);
            pieChartEstadoVehiculos.applyCss();
            pieChartEstadoVehiculos.layout();
        });
    }

    private void cargarDatosPiezas() {
        ApiClient.ApiResponse resp = ApiClient.getInstance().get("/api/piezas");
        if (!resp.isSuccess()) {
            LoggerUtil.error("Error API piezas: " + resp.getStatusCode(), null);
            return;
        }

        JsonArray arr = JsonParser.parseString(resp.getBody()).getAsJsonArray();

        Map<String, Integer> porCategoria = new LinkedHashMap<>();
        arr.forEach(e -> {
            JsonObject p = e.getAsJsonObject();
            porCategoria.merge(getStr(p, "categoria"), 1, Integer::sum);
        });

        ObservableList<PieChart.Data> pieData = FXCollections.observableArrayList();
        porCategoria.forEach((cat, cnt) -> pieData.add(new PieChart.Data(cat, cnt)));

        Platform.runLater(() -> {
            lblTotalPiezas.setText(String.valueOf(arr.size()));
            pieChartPiezas.getData().clear();
            pieChartPiezas.setData(pieData);
            pieChartPiezas.applyCss();
            pieChartPiezas.layout();
        });
    }

    private void cargarDatosSolicitudes() {
        ApiClient.ApiResponse resp = ApiClient.getInstance().get("/api/solicitudes");
        if (!resp.isSuccess()) {
            LoggerUtil.error("Error API solicitudes: " + resp.getStatusCode(), null);
            return;
        }

        JsonArray arr = JsonParser.parseString(resp.getBody()).getAsJsonArray();

        Map<String, Integer> porEstado = new LinkedHashMap<>();
        porEstado.put("Pendiente", 0);
        porEstado.put("En negociación", 0);
        porEstado.put("Aprobada", 0);
        porEstado.put("Rechazada", 0);

        double ingresos = 0;
        for (int i = 0; i < arr.size(); i++) {
            JsonObject s = arr.get(i).getAsJsonObject();
            String estado = getStr(s, "estado");
            String label = traducirEstadoSolicitud(estado);
            porEstado.merge(label, 1, Integer::sum);
            if ("aprobada".equals(estado) && s.has("precioTotal") && !s.get("precioTotal").isJsonNull()) {
                ingresos += s.get("precioTotal").getAsDouble();
            }
        }

        XYChart.Series<String, Integer> series = new XYChart.Series<>();
        series.setName("Solicitudes");
        porEstado.forEach((estado, cnt) -> series.getData().add(new XYChart.Data<>(estado, cnt)));

        int pendientes = porEstado.getOrDefault("Pendiente", 0)
                       + porEstado.getOrDefault("En negociación", 0);
        double ingresosTotal = ingresos;

        Platform.runLater(() -> {
            lblSolicitudesPendientes.setText(String.valueOf(pendientes));
            lblIngresos.setText(String.format("%.0f €", ingresosTotal));

            barChartSolicitudes.getData().clear();
            barChartSolicitudes.getData().add(series);
            barChartSolicitudes.applyCss();
            barChartSolicitudes.layout();
        });
    }

    private String traducirEstadoVehiculo(String estado) {
        return switch (estado.toLowerCase()) {
            case "completo"     -> "Completo";
            case "desguazando"  -> "Desguazando";
            case "desguazado"   -> "Desguazado";
            default             -> estado;
        };
    }

    private String traducirEstadoSolicitud(String estado) {
        return switch (estado.toLowerCase()) {
            case "pendiente"       -> "Pendiente";
            case "en_negociacion"  -> "En negociación";
            case "aprobada"        -> "Aprobada";
            case "rechazada"       -> "Rechazada";
            default                -> estado;
        };
    }

    private String getStr(JsonObject obj, String key) {
        return obj.has(key) && !obj.get(key).isJsonNull() ? obj.get(key).getAsString() : "";
    }
}
