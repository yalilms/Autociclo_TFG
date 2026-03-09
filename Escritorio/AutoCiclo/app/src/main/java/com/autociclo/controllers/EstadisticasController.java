package com.autociclo.controllers;

import com.autociclo.database.ConexionBD;
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
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
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
        // Mostrar indicador de carga
        if (loadingOverlay != null) {
            loadingOverlay.setVisible(true);
        }

        // Cargar datos en hilo separado para no bloquear la UI
        new Thread(() -> {
            cargarDatosVehiculosPorMarca();
            cargarDatosPiezasPorCategoria();
            cargarDatosKilometraje();

            // Ocultar indicador de carga en el hilo de JavaFX
            Platform.runLater(() -> {
                if (loadingOverlay != null) {
                    loadingOverlay.setVisible(false);
                }
            });
        }).start();
    }

    private void cargarDatosVehiculosPorMarca() {
        XYChart.Series<String, Integer> series = new XYChart.Series<>();
        series.setName("Vehículos");

        String sql = "SELECT marca, COUNT(*) as cantidad FROM VEHICULOS GROUP BY marca";

        try (Connection conn = ConexionBD.getConexion();
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                String marca = rs.getString("marca");
                int cantidad = rs.getInt("cantidad");
                series.getData().add(new XYChart.Data<>(marca, cantidad));
            }

            // Actualizar UI en el hilo de JavaFX
            final XYChart.Series<String, Integer> finalSeries = series;
            Platform.runLater(() -> {
                barChartVehiculos.getData().clear();
                barChartVehiculos.getData().add(finalSeries);
            });

        } catch (Exception e) {
            LoggerUtil.error("Error al cargar estadísticas de vehículos", e);
        }
    }

    private void cargarDatosPiezasPorCategoria() {
        ObservableList<PieChart.Data> pieChartData = FXCollections.observableArrayList();

        String sql = "SELECT categoria, COUNT(*) as cantidad FROM PIEZAS GROUP BY categoria";

        try (Connection conn = ConexionBD.getConexion();
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                String categoria = rs.getString("categoria");
                int cantidad = rs.getInt("cantidad");
                pieChartData.add(new PieChart.Data(categoria, cantidad));
            }

            // Actualizar UI en el hilo de JavaFX
            Platform.runLater(() -> {
                // Limpiar datos anteriores para evitar texto superpuesto
                pieChartPiezas.getData().clear();
                pieChartPiezas.setData(pieChartData);
            });

        } catch (Exception e) {
            LoggerUtil.error("Error al cargar estadísticas de piezas", e);
        }
    }

    private void cargarDatosKilometraje() {
        XYChart.Series<String, Integer> series = new XYChart.Series<>();
        series.setName("Kilometraje");

        String sql = "SELECT marca, modelo, kilometraje FROM VEHICULOS ORDER BY kilometraje DESC LIMIT 5";

        try (Connection conn = ConexionBD.getConexion();
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                String label = rs.getString("marca") + " " + rs.getString("modelo");
                int km = rs.getInt("kilometraje");
                series.getData().add(new XYChart.Data<>(label, km));
            }

            // Actualizar UI en el hilo de JavaFX
            final XYChart.Series<String, Integer> finalSeries = series;
            Platform.runLater(() -> {
                barChartKilometraje.getData().clear();
                barChartKilometraje.getData().add(finalSeries);
            });

        } catch (Exception e) {
            LoggerUtil.error("Error al cargar estadísticas de kilometraje", e);
        }
    }
}
