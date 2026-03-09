package com.autociclo.controllers;

import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.TextArea;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.stage.Stage;
import com.autociclo.models.Pieza;
import java.io.InputStream;

public class DetallePiezaController {

    @FXML
    private Label lblTitulo;
    @FXML
    private Label lblId;
    @FXML
    private Label lblCodigo;
    @FXML
    private Label lblNombre;
    @FXML
    private Label lblCategoria;
    @FXML
    private Label lblPrecio;
    @FXML
    private Label lblStockDisponible;
    @FXML
    private Label lblStockMinimo;
    @FXML
    private Label lblUbicacion;
    @FXML
    private Label lblCompatible;
    @FXML
    private TextArea txtDescripcion;
    @FXML
    private ImageView imgPieza;
    @FXML
    private Label lblSinImagen;
    @FXML
    private Button btnCerrar;

    /**
     * Establece los datos de la pieza a mostrar
     */
    public void setPieza(Pieza pieza) {
        if (pieza != null) {
            lblTitulo.setText("DETALLES DE LA PIEZA: " + pieza.getNombre());
            lblId.setText(String.valueOf(pieza.getIdPieza()));
            lblCodigo.setText(pieza.getCodigoPieza());
            lblNombre.setText(pieza.getNombre());
            lblCategoria.setText(pieza.getCategoria());
            lblPrecio.setText(String.format("%.2f €", pieza.getPrecioVenta()));
            lblStockDisponible.setText(pieza.getStockDisponible() + " unidades");
            lblStockMinimo.setText(pieza.getStockMinimo() + " unidades");
            lblUbicacion.setText(pieza.getUbicacionAlmacen());
            lblCompatible.setText(pieza.getCompatibleMarcas() != null && !pieza.getCompatibleMarcas().isEmpty()
                    ? pieza.getCompatibleMarcas()
                    : "No especificado");
            txtDescripcion.setText(pieza.getDescripcion() != null && !pieza.getDescripcion().isEmpty()
                    ? pieza.getDescripcion()
                    : "Sin descripción");

            // Cargar imagen
            cargarImagen(pieza.getImagen());
        }

        // Configurar botón cerrar
        btnCerrar.setOnAction(event -> cerrarVentana());
    }

    /**
     * Carga y muestra la imagen de la pieza
     * 
     * @param imagenData Puede ser Base64 o ruta de imagen en resources
     */
    private void cargarImagen(String imagenData) {
        if (imagenData != null && !imagenData.isEmpty()) {
            try {
                Image image;

                // Verificar si es Base64 (comienza con "data:image")
                if (imagenData.startsWith("data:image")) {
                    // Decodificar Base64
                    String base64Data = imagenData.substring(imagenData.indexOf(",") + 1);
                    byte[] imageBytes = java.util.Base64.getDecoder().decode(base64Data);
                    image = new Image(new java.io.ByteArrayInputStream(imageBytes));
                } else {
                    // Cargar como ruta de archivo (compatibilidad con datos antiguos)
                    InputStream is = getClass().getResourceAsStream(imagenData);
                    if (is != null) {
                        image = new Image(is);
                    } else {
                        image = null;
                    }
                }

                if (image != null && !image.isError()) {
                    imgPieza.setImage(image);
                    imgPieza.setVisible(true);
                    lblSinImagen.setVisible(false);
                } else {
                    imgPieza.setImage(null);
                    imgPieza.setVisible(false);
                    lblSinImagen.setVisible(true);
                }
            } catch (Exception e) {
                imgPieza.setImage(null);
                imgPieza.setVisible(false);
                lblSinImagen.setVisible(true);
            }
        } else {
            imgPieza.setImage(null);
            imgPieza.setVisible(false);
            lblSinImagen.setVisible(true);
        }
    }

    /**
     * Cierra la ventana de detalles
     */
    private void cerrarVentana() {
        Stage stage = (Stage) btnCerrar.getScene().getWindow();
        stage.close();
    }
}
