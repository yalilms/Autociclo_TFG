package com.autociclo.controllers;

import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.TextArea;
import javafx.stage.Stage;
import com.autociclo.models.Vehiculo;

public class DetalleVehiculoController {

    @FXML private Label lblTitulo;
    @FXML private Label lblId;
    @FXML private Label lblMatricula;
    @FXML private Label lblMarca;
    @FXML private Label lblModelo;
    @FXML private Label lblAnio;
    @FXML private Label lblColor;
    @FXML private Label lblKilometraje;
    @FXML private Label lblEstado;
    @FXML private Label lblPrecioCompra;
    @FXML private Label lblFechaEntrada;
    @FXML private Label lblUbicacion;
    @FXML private TextArea txtObservaciones;
    @FXML private Button btnCerrar;

    /**
     * Establece los datos del vehículo a mostrar
     */
    public void setVehiculo(Vehiculo vehiculo) {
        if (vehiculo != null) {
            lblTitulo.setText("DETALLES DEL VEHÍCULO: " + vehiculo.getMarca() + " " + vehiculo.getModelo());
            lblId.setText(String.valueOf(vehiculo.getIdVehiculo()));
            lblMatricula.setText(vehiculo.getMatricula());
            lblMarca.setText(vehiculo.getMarca());
            lblModelo.setText(vehiculo.getModelo());
            lblAnio.setText(String.valueOf(vehiculo.getAnio()));
            lblColor.setText(vehiculo.getColor());
            lblKilometraje.setText(vehiculo.getKilometraje() + " km");
            lblEstado.setText(vehiculo.getEstado());
            lblPrecioCompra.setText(String.format("%.2f €", vehiculo.getPrecioCompra()));
            lblFechaEntrada.setText(vehiculo.getFechaEntrada());
            lblUbicacion.setText(vehiculo.getUbicacionGps() != null && !vehiculo.getUbicacionGps().isEmpty()
                                ? vehiculo.getUbicacionGps() : "No especificada");
            txtObservaciones.setText(vehiculo.getObservaciones() != null && !vehiculo.getObservaciones().isEmpty()
                                    ? vehiculo.getObservaciones() : "Sin observaciones");
        }

        // Configurar botón cerrar
        btnCerrar.setOnAction(event -> cerrarVentana());
    }

    /**
     * Cierra la ventana de detalles
     */
    private void cerrarVentana() {
        Stage stage = (Stage) btnCerrar.getScene().getWindow();
        stage.close();
    }
}
