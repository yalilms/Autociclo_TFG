package com.autociclo.controllers;

import com.autociclo.api.ApiClient;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
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

import javafx.application.Platform;
import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.nio.file.Files;
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
    private ComboBox<String> cmbUbicacion;
    @FXML
    private TextField txtMaterialesCompatibles;
    @FXML
    private TextField txtNombre;
    @FXML
    private TextField txtPrecioCompra;
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

        // El código se genera automáticamente al seleccionar categoría
        txtCodigo.setEditable(false);
        txtCodigo.setPromptText("Se genera al seleccionar categoría");

        txtPrecioCompra.setText("0");
        txtPrecioCompra.setTextFormatter(new javafx.scene.control.TextFormatter<>(change -> {
            String nuevo = change.getControlNewText();
            return nuevo.matches("\\d*(\\.\\d{0,2})?") ? change : null;
        }));

        // Inicializar ComboBox de categoría con enum
        cmbCategoria.getItems().addAll(PieceCategory.getCodes());

        // Auto-generar código al seleccionar categoría (solo en modo nuevo)
        cmbCategoria.setOnAction(event -> {
            if (!modoEdicion && cmbCategoria.getValue() != null) {
                generarCodigoAutomatico(cmbCategoria.getValue());
            }
        });

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

        // Convertir imagen a Base64 si se seleccionó una
        String imagenBase64 = convertirImagenABase64();

        try {
            JsonObject body = new JsonObject();
            body.addProperty("codigoPieza",       txtCodigo.getText().trim().toUpperCase());
            body.addProperty("nombre",             txtNombre.getText().trim());
            body.addProperty("categoria",          cmbCategoria.getValue());
            body.addProperty("precioVenta",        Double.parseDouble(txtPrecioCompra.getText().trim().replace(",", ".")));
            body.addProperty("stockDisponible",    0);
            body.addProperty("stockMinimo",        1);
            body.addProperty("ubicacionAlmacen",   cmbUbicacion.getValue() != null ? cmbUbicacion.getValue() : "");
            body.addProperty("compatibleMarcas",   txtMaterialesCompatibles.getText().trim());
            body.addProperty("descripcion",        txtDescripcion.getText().trim());
            String imagenFinal = imagenBase64 != null ? imagenBase64
                    : (piezaEditar != null ? piezaEditar.getImagen() : null);
            if (imagenFinal != null) body.addProperty("imagen", imagenFinal);

            btnGuardar.setDisable(true);
            new Thread(() -> {
                ApiClient.ApiResponse resp = modoEdicion
                        ? ApiClient.getInstance().put("/api/piezas/" + piezaEditar.getIdPieza(), body)
                        : ApiClient.getInstance().post("/api/piezas", body);
                Platform.runLater(() -> {
                    btnGuardar.setDisable(false);
                    if (resp.isSuccess()) {
                        String msg = modoEdicion ? "Pieza actualizada correctamente"
                                : "Pieza registrada con código: " + body.get("codigoPieza").getAsString();
                        ValidationUtils.showSuccess("Operación exitosa", msg);
                        if (controladorPadre != null) controladorPadre.actualizarListado();
                        cerrarVentana();
                    } else if (resp.getStatusCode() == 409) {
                        ValidationUtils.showError("Código duplicado", "Ya existe una pieza con ese código.");
                    } else {
                        ValidationUtils.showError("Error al guardar", "Código: " + resp.getStatusCode());
                    }
                });
            }).start();
        } catch (NumberFormatException e) {
            ErrorHandler.handleNumberFormatError("formulario de pieza");
        }
    }

    private void generarCodigoAutomatico(String categoria) {
        String prefijo = getPrefijoPorCategoria(categoria);
        txtCodigo.setPromptText("Generando...");
        new Thread(() -> {
            ApiClient.ApiResponse resp = ApiClient.getInstance().get("/api/piezas");
            Platform.runLater(() -> {
                int maxNum = 0;
                if (resp.isSuccess()) {
                    try {
                        JsonArray arr = JsonParser.parseString(resp.getBody()).getAsJsonArray();
                        for (JsonElement e : arr) {
                            String cod = e.getAsJsonObject().get("codigoPieza").getAsString();
                            if (cod.startsWith(prefijo + "-")) {
                                try {
                                    int n = Integer.parseInt(cod.substring(prefijo.length() + 1));
                                    if (n > maxNum) maxNum = n;
                                } catch (NumberFormatException ignored) {}
                            }
                        }
                    } catch (Exception ignored) {}
                }
                txtCodigo.setText(String.format("%s-%03d", prefijo, maxNum + 1));
                txtCodigo.setPromptText("");
                txtCodigo.setEditable(false);
            });
        }).start();
    }

    private String getPrefijoPorCategoria(String categoria) {
        return switch (categoria.toLowerCase()) {
            case "motor"       -> "MOT";
            case "carroceria"  -> "CAR";
            case "interior"    -> "INT";
            case "electronica" -> "ELE";
            case "ruedas"      -> "RUE";
            default            -> "OTR";
        };
    }

    private void cerrarVentana() {
        WindowUtils.closeWindow(btnCancelar);
    }
}
