package com.autociclo.controllers;

import com.autociclo.database.ConexionBD;
import com.autociclo.models.Pieza;
import com.autociclo.utils.ValidationUtils;
import com.autociclo.utils.LoggerUtil;
import com.autociclo.utils.UbicacionesJsonLoader;
import com.autociclo.utils.AppConstants;
import com.autociclo.utils.WindowUtils;
import com.autociclo.utils.ErrorHandler;
import com.autociclo.enums.PieceCategory;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.*;
import javafx.stage.FileChooser;
import javafx.stage.Stage;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.nio.file.Files;
import java.sql.*;
import java.util.ResourceBundle;

/**
 * Controlador para el formulario de piezas
 * 
 * @author Yalil Musa Talhaoui
 */
public class FormularioPiezaController implements Initializable {

    @FXML
    private Label lblTitulo;
    @FXML
    private TextField txtCodigo;
    @FXML
    private ComboBox<String> cmbCategoria;
    @FXML
    private TextField txtStockDisponible;
    @FXML
    private ComboBox<String> cmbUbicacion;
    @FXML
    private TextField txtMaterialesCompatibles;
    @FXML
    private TextField txtNombre;
    @FXML
    private TextField txtPrecioCompra;
    @FXML
    private TextField txtStockMinimo;
    @FXML
    private TextField txtRutaImagen;
    @FXML
    private Button btnSeleccionarImagen;
    @FXML
    private TextArea txtDescripcion;
    @FXML
    private Button btnCancelar;
    @FXML
    private Button btnGuardar;

    // Variables para el modo edición
    private Pieza piezaEditar = null;
    private boolean modoEdicion = false;
    private ListadoMaestroController controladorPadre;
    private File archivoImagenSeleccionado = null;

    @Override
    public void initialize(URL url, ResourceBundle rb) {
        // Configurar título por defecto (modo nuevo)
        lblTitulo.setText("NUEVA PIEZA");

        // Configurar eventos de los botones
        btnGuardar.setOnAction(event -> guardarPieza());
        btnCancelar.setOnAction(event -> cerrarVentana());
        btnSeleccionarImagen.setOnAction(event -> seleccionarImagen());

        // Inicializar ComboBox de categoría con enum
        cmbCategoria.getItems().addAll(PieceCategory.getCodes());

        // Cargar ubicaciones desde el JSON
        cargarUbicaciones();
    }

    private void cargarUbicaciones() {
        cmbUbicacion.getItems().addAll(UbicacionesJsonLoader.obtenerUbicacionesPiezas());
    }

    /**
     * Abre un FileChooser para seleccionar una imagen
     */
    private void seleccionarImagen() {
        FileChooser fileChooser = new FileChooser();
        fileChooser.setTitle("Seleccionar Imagen de la Pieza");

        // Filtros de extensión
        fileChooser.getExtensionFilters().addAll(
                new FileChooser.ExtensionFilter("Imágenes", "*.png", "*.jpg", "*.jpeg", "*.gif"),
                new FileChooser.ExtensionFilter("Todos los archivos", "*.*"));

        // Mostrar el diálogo
        Stage stage = (Stage) btnSeleccionarImagen.getScene().getWindow();
        File archivoSeleccionado = fileChooser.showOpenDialog(stage);

        if (archivoSeleccionado != null) {
            archivoImagenSeleccionado = archivoSeleccionado;
            txtRutaImagen.setText(archivoSeleccionado.getName());
            LoggerUtil.info("Imagen seleccionada: " + archivoSeleccionado.getAbsolutePath());
        }
    }

    /**
     * Convierte la imagen seleccionada a una cadena Base64
     * 
     * @return La cadena Base64 de la imagen o null si hay error
     */
    private String convertirImagenABase64() {
        if (archivoImagenSeleccionado == null) {
            return null;
        }

        try {
            // Leer los bytes de la imagen
            byte[] bytesImagen = Files.readAllBytes(archivoImagenSeleccionado.toPath());

            // Codificar a Base64
            String base64 = java.util.Base64.getEncoder().encodeToString(bytesImagen);

            // Añadir prefijo con tipo MIME
            String extension = archivoImagenSeleccionado.getName().substring(
                    archivoImagenSeleccionado.getName().lastIndexOf(".") + 1).toLowerCase();
            String mimeType = "image/" + (extension.equals("jpg") ? "jpeg" : extension);

            String base64ConPrefijo = "data:" + mimeType + ";base64," + base64;

            LoggerUtil.info("Imagen convertida a Base64 (" + base64ConPrefijo.length() + " caracteres)");

            return base64ConPrefijo;

        } catch (IOException e) {
            LoggerUtil.error("Error al convertir imagen a Base64", e);
            ValidationUtils.showError("Error", "No se pudo procesar la imagen: " + e.getMessage());
            return null;
        }
    }

    /**
     * Configura el controlador padre para poder actualizar el listado
     */
    public void setControladorPadre(ListadoMaestroController controlador) {
        this.controladorPadre = controlador;
    }

    /**
     * Configura la pieza a editar y rellena los campos
     */
    public void setPiezaEditar(Pieza pieza) {
        this.piezaEditar = pieza;
        this.modoEdicion = true;
        lblTitulo.setText("EDITAR PIEZA");
        cargarDatosPieza();
    }

    /**
     * Carga los datos de la pieza en el formulario
     */
    private void cargarDatosPieza() {
        if (piezaEditar != null) {
            txtCodigo.setText(piezaEditar.getCodigoPieza());
            txtCodigo.setEditable(false); // No permitir editar el código (clave única)
            txtNombre.setText(piezaEditar.getNombre());
            cmbCategoria.setValue(piezaEditar.getCategoria());
            txtPrecioCompra.setText(String.valueOf(piezaEditar.getPrecioVenta()));
            txtStockDisponible.setText(String.valueOf(piezaEditar.getStockDisponible()));
            txtStockMinimo.setText(String.valueOf(piezaEditar.getStockMinimo()));
            cmbUbicacion.setValue(piezaEditar.getUbicacionAlmacen());
            txtMaterialesCompatibles.setText(piezaEditar.getCompatibleMarcas());
            txtDescripcion.setText(piezaEditar.getDescripcion());

            // Cargar imagen si existe
            if (piezaEditar.getImagen() != null && !piezaEditar.getImagen().isEmpty()) {
                txtRutaImagen.setText(piezaEditar.getImagen());
            }
        }
    }

    /**
     * Valida todos los campos del formulario
     */
    private boolean validarCampos() {
        StringBuilder errores = new StringBuilder();
        boolean valido = true;

        // Validar código de pieza (obligatorio y alfanumérico)
        if (!ValidationUtils.validateCodigoPieza(txtCodigo, null)) {
            errores.append("• Código: Debe ser alfanumérico (letras, números y guión)\n");
            valido = false;
        }

        // Validar nombre (obligatorio)
        if (!ValidationUtils.validateNotEmpty(txtNombre, null, "Nombre")) {
            errores.append("• Nombre: Campo obligatorio\n");
            valido = false;
        }

        // Validar categoría (obligatorio)
        if (cmbCategoria.getValue() == null || cmbCategoria.getValue().isEmpty()) {
            errores.append("• Categoría: Debe seleccionar una categoría\n");
            cmbCategoria.setStyle(AppConstants.STYLE_ERROR);
            valido = false;
        } else {
            cmbCategoria.setStyle(AppConstants.STYLE_SUCCESS);
        }

        // Validar precio de venta (decimal >= 0)
        if (!ValidationUtils.validateDoubleMinimum(txtPrecioCompra, null, "Precio de venta", 0)) {
            errores.append("• Precio de venta: Debe ser un número mayor o igual a 0\n");
            valido = false;
        }

        // Validar stock disponible (entero >= 0)
        if (!ValidationUtils.validateNonNegativeInteger(txtStockDisponible, null, "Stock disponible")) {
            errores.append("• Stock disponible: Debe ser un número entero positivo\n");
            valido = false;
        }

        // Validar stock mínimo (entero >= 0)
        if (!ValidationUtils.validateNonNegativeInteger(txtStockMinimo, null, "Stock mínimo")) {
            errores.append("• Stock mínimo: Debe ser un número entero positivo\n");
            valido = false;
        }

        // Validar ubicación (obligatorio)
        if (cmbUbicacion.getValue() == null || cmbUbicacion.getValue().isEmpty()) {
            errores.append("• Ubicación: Debe seleccionar una ubicación\n");
            cmbUbicacion.setStyle(AppConstants.STYLE_ERROR);
            valido = false;
        } else {
            cmbUbicacion.setStyle(AppConstants.STYLE_SUCCESS);
        }

        // Si hay errores, mostrarlos en el Alert
        if (!valido) {
            ValidationUtils.showAlert("Errores de validación",
                    "Por favor, corrija los siguientes errores:",
                    errores.toString(),
                    Alert.AlertType.ERROR);
        }

        return valido;
    }

    /**
     * Guarda la pieza en la base de datos
     */
    private void guardarPieza() {
        // Validar campos (el Alert de errores ya se muestra dentro de validarCampos())
        if (!validarCampos()) {
            return;
        }

        // Comprobar si el código ya existe (solo en modo inserción)
        if (!modoEdicion && existeCodigo(txtCodigo.getText().trim())) {
            ValidationUtils.showError("Código duplicado",
                    "Ya existe una pieza con ese código en el sistema");
            return;
        }

        // Convertir imagen a Base64 si se seleccionó una
        String imagenBase64 = convertirImagenABase64();

        try (Connection conn = ConexionBD.getConexion()) {
            String sql;

            if (modoEdicion) {
                // UPDATE con PreparedStatement (antiinyección SQL)
                sql = "UPDATE PIEZAS SET nombre=?, categoria=?, precio_venta=?, stock_disponible=?, " +
                        "stock_minimo=?, ubicacion_almacen=?, compatible_marcas=?, imagen=?, descripcion=? " +
                        "WHERE codigo_pieza=?";
            } else {
                // INSERT con PreparedStatement (antiinyección SQL)
                sql = "INSERT INTO PIEZAS (codigo_pieza, nombre, categoria, precio_venta, stock_disponible, " +
                        "stock_minimo, ubicacion_almacen, compatible_marcas, imagen, descripcion) " +
                        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            }

            PreparedStatement pstmt = conn.prepareStatement(sql);

            if (modoEdicion) {
                // UPDATE: asignar parámetros
                pstmt.setString(1, txtNombre.getText().trim());
                pstmt.setString(2, cmbCategoria.getValue());
                pstmt.setDouble(3, Double.parseDouble(txtPrecioCompra.getText().trim().replace(",", ".")));
                pstmt.setInt(4, txtStockDisponible.getText().trim().isEmpty() ? 0
                        : Integer.parseInt(txtStockDisponible.getText().trim()));
                pstmt.setInt(5, txtStockMinimo.getText().trim().isEmpty() ? 1
                        : Integer.parseInt(txtStockMinimo.getText().trim()));
                pstmt.setString(6, cmbUbicacion.getValue() != null ? cmbUbicacion.getValue() : "");
                pstmt.setString(7, txtMaterialesCompatibles.getText().trim());
                // Si se seleccionó nueva imagen (Base64), actualizarla; si no, mantener la
                // existente
                pstmt.setString(8,
                        imagenBase64 != null ? imagenBase64 : (piezaEditar != null ? piezaEditar.getImagen() : null));
                pstmt.setString(9, txtDescripcion.getText().trim());
                pstmt.setString(10, txtCodigo.getText().trim()); // WHERE codigo_pieza
            } else {
                // INSERT: asignar parámetros
                pstmt.setString(1, txtCodigo.getText().trim().toUpperCase());
                pstmt.setString(2, txtNombre.getText().trim());
                pstmt.setString(3, cmbCategoria.getValue());
                pstmt.setDouble(4, Double.parseDouble(txtPrecioCompra.getText().trim().replace(",", ".")));
                pstmt.setInt(5, txtStockDisponible.getText().trim().isEmpty() ? 0
                        : Integer.parseInt(txtStockDisponible.getText().trim()));
                pstmt.setInt(6, txtStockMinimo.getText().trim().isEmpty() ? 1
                        : Integer.parseInt(txtStockMinimo.getText().trim()));
                pstmt.setString(7, cmbUbicacion.getValue() != null ? cmbUbicacion.getValue() : "");
                pstmt.setString(8, txtMaterialesCompatibles.getText().trim());
                pstmt.setString(9, imagenBase64); // imagen en Base64
                pstmt.setString(10, txtDescripcion.getText().trim());
            }

            int filasAfectadas = pstmt.executeUpdate();

            if (filasAfectadas > 0) {
                String mensaje = modoEdicion ? "Pieza actualizada correctamente"
                        : "Pieza registrada correctamente con código: " + txtCodigo.getText().trim().toUpperCase();

                ValidationUtils.showSuccess("Operación exitosa", mensaje);

                // Actualizar el listado del controlador padre
                if (controladorPadre != null) {
                    controladorPadre.actualizarListado();
                }

                // Cerrar ventana
                cerrarVentana();
            }

        } catch (SQLException e) {
            ErrorHandler.handleSaveError(e, "pieza");
        } catch (NumberFormatException e) {
            ErrorHandler.handleNumberFormatError("formulario de pieza");
        }
    }

    /**
     * Comprueba si ya existe una pieza con el código indicado
     */
    private boolean existeCodigo(String codigo) {
        try (Connection conn = ConexionBD.getConexion()) {
            String sql = "SELECT COUNT(*) FROM PIEZAS WHERE codigo_pieza = ?";
            PreparedStatement pstmt = conn.prepareStatement(sql);
            pstmt.setString(1, codigo.toUpperCase());

            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                return rs.getInt(1) > 0;
            }
        } catch (SQLException e) {
            LoggerUtil.error("Error al verificar existencia de código de pieza", e);
        }
        return false;
    }

    private void cerrarVentana() {
        WindowUtils.closeWindow(btnCancelar);
    }
}
