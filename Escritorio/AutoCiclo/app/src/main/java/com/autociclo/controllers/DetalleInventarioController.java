package com.autociclo.controllers;

import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.TextArea;
import javafx.stage.Stage;
import com.autociclo.models.InventarioPieza;

public class DetalleInventarioController {

    @FXML private Label lblTitulo;
    @FXML private Label lblVehiculo;
    @FXML private Label lblPieza;
    @FXML private Label lblCantidad;
    @FXML private Label lblEstado;
    @FXML private Label lblFecha;
    @FXML private Label lblPrecio;
    @FXML private TextArea txtNotas;
    @FXML private Button btnCerrar;

    /**
     * Establece los datos del inventario a mostrar
     */
    public void setInventario(InventarioPieza inventario) {
        if (inventario != null) {
            lblTitulo.setText("DETALLES DEL INVENTARIO: " + inventario.getPiezaNombre());
            lblVehiculo.setText(inventario.getVehiculoInfo());
            lblPieza.setText(inventario.getPiezaNombre());
            lblCantidad.setText(inventario.getCantidad() + " unidades");
            lblEstado.setText(inventario.getEstadoPieza());
            lblFecha.setText(inventario.getFechaExtraccion());
            lblPrecio.setText(String.format("%.2f €", inventario.getPrecioUnitario()));
            txtNotas.setText(inventario.getNotas() != null && !inventario.getNotas().isEmpty()
                           ? inventario.getNotas() : "Sin notas adicionales");
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
