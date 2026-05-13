package com.autociclo.controllers;

import com.autociclo.api.ApiClient;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.autociclo.models.InventarioPieza;
import com.autociclo.models.Vehiculo;
import com.autociclo.models.Pieza;
import com.autociclo.utils.ValidationUtils;
import com.autociclo.utils.LoggerUtil;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.collections.transformation.FilteredList;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.*;
import javafx.stage.Stage;

import javafx.application.Platform;
import java.net.URL;
import java.time.LocalDate;
import java.util.ResourceBundle;

/**
 * Controlador para asignar piezas a vehículos (Inventario)
 * @author Yalil Musa Talhaoui
 */
public class AsignarPiezaVehiculoController implements Initializable {

    @FXML private ComboBox<Vehiculo> cmbVehiculo;
    @FXML private TextField txtFiltroVehiculo;
    @FXML private ComboBox<Pieza> cmbPieza;
    @FXML private TextField txtFiltroPieza;
    @FXML private TextField txtCantidad;
    @FXML private RadioButton rbNuevo;
    @FXML private RadioButton rbUsado;
    @FXML private RadioButton rbReparado;
    @FXML private ToggleGroup grupoContenedor;
    @FXML private TextField txtPrecioMecanico;
    @FXML private DatePicker dpFechaAsignacion;
    @FXML private TextArea txtNotas;
    @FXML private Button btnCancelar;
    @FXML private Button btnAsignar;

    // Variables para el modo edición
    private InventarioPieza inventarioEditar = null;
    private boolean modoEdicion = false;
    private ListadoMaestroController controladorPadre;

    // Listas para ComboBoxes
    private ObservableList<Vehiculo> listaVehiculos = FXCollections.observableArrayList();
    private ObservableList<Pieza> listaPiezas = FXCollections.observableArrayList();

    // Listas filtradas para búsqueda en tiempo real
    private FilteredList<Vehiculo> vehiculosFiltrados;
    private FilteredList<Pieza> piezasFiltradas;

    @Override
    public void initialize(URL url, ResourceBundle rb) {
        // Configurar el ToggleGroup para los RadioButtons
        grupoContenedor = new ToggleGroup();
        rbNuevo.setToggleGroup(grupoContenedor);
        rbUsado.setToggleGroup(grupoContenedor);
        rbReparado.setToggleGroup(grupoContenedor);

        // Seleccionar "Usado" por defecto
        rbUsado.setSelected(true);

        // Establecer fecha actual por defecto
        dpFechaAsignacion.setValue(LocalDate.now());
        txtCantidad.setText("1");
        txtCantidad.setTextFormatter(new javafx.scene.control.TextFormatter<>(
            (javafx.scene.control.TextFormatter.Change c) ->
                c.getControlNewText().matches("\\d*") ? c : null));
        txtPrecioMecanico.setText("0");
        txtPrecioMecanico.setTextFormatter(new javafx.scene.control.TextFormatter<>(
            (javafx.scene.control.TextFormatter.Change c) ->
                c.getControlNewText().matches("\\d*(\\.\\d{0,2})?") ? c : null));

        // Conectar eventos de los botones
        btnAsignar.setOnAction(event -> guardarInventario());
        btnCancelar.setOnAction(event -> cerrarVentana());

        // Cargar listas de vehículos y piezas
        cargarVehiculos();
        cargarPiezas();

        // Configurar filtrado en tiempo real
        configurarFiltradoVehiculos();
        configurarFiltradoPiezas();
    }

    /**
     * Configura el filtrado en tiempo real para vehículos
     */
    private void configurarFiltradoVehiculos() {
        // Crear lista filtrada basada en la lista original
        vehiculosFiltrados = new FilteredList<>(listaVehiculos, p -> true);

        // Vincular el ComboBox a la lista filtrada
        cmbVehiculo.setItems(vehiculosFiltrados);

        // Listener para el campo de filtro
        txtFiltroVehiculo.textProperty().addListener((observable, oldValue, newValue) -> {
            vehiculosFiltrados.setPredicate(vehiculo -> {
                // Si el filtro está vacío, mostrar todos
                if (newValue == null || newValue.isEmpty()) {
                    return true;
                }

                // Comparar matrícula (ignorar mayúsculas/minúsculas)
                String filtroMinusculas = newValue.toLowerCase();
                String matricula = vehiculo.getMatricula().toLowerCase();

                // Filtrar por matrícula
                return matricula.contains(filtroMinusculas);
            });

            // Si solo queda un elemento tras filtrar, seleccionarlo automáticamente
            if (vehiculosFiltrados.size() == 1) {
                cmbVehiculo.setValue(vehiculosFiltrados.get(0));
            }
        });
    }

    /**
     * Configura el filtrado en tiempo real para piezas
     */
    private void configurarFiltradoPiezas() {
        // Crear lista filtrada basada en la lista original
        piezasFiltradas = new FilteredList<>(listaPiezas, p -> true);

        // Vincular el ComboBox a la lista filtrada
        cmbPieza.setItems(piezasFiltradas);

        // Listener para el campo de filtro
        txtFiltroPieza.textProperty().addListener((observable, oldValue, newValue) -> {
            piezasFiltradas.setPredicate(pieza -> {
                // Si el filtro está vacío, mostrar todos
                if (newValue == null || newValue.isEmpty()) {
                    return true;
                }

                // Comparar código de pieza (ignorar mayúsculas/minúsculas)
                String filtroMinusculas = newValue.toLowerCase();
                String codigoPieza = pieza.getCodigoPieza().toLowerCase();

                // Filtrar por código de pieza
                return codigoPieza.contains(filtroMinusculas);
            });

            // Si solo queda un elemento tras filtrar, seleccionarlo automáticamente
            if (piezasFiltradas.size() == 1) {
                cmbPieza.setValue(piezasFiltradas.get(0));
            }
        });
    }

    /**
     * Configura el controlador padre para poder actualizar el listado
     */
    public void setControladorPadre(ListadoMaestroController controlador) {
        this.controladorPadre = controlador;
    }

    /**
     * Configura el inventario a editar y rellena los campos
     */
    public void setInventarioEditar(InventarioPieza inventario) {
        this.inventarioEditar = inventario;
        this.modoEdicion = true;
        cargarDatosInventario();
    }

    /**
     * Carga los vehículos disponibles en el ComboBox via API
     */
    private void cargarVehiculos() {
        listaVehiculos.clear();
        new Thread(() -> {
            ApiClient.ApiResponse resp = ApiClient.getInstance().get("/api/vehiculos");
            Platform.runLater(() -> {
                if (resp.isSuccess()) {
                    JsonArray arr = JsonParser.parseString(resp.getBody()).getAsJsonArray();
                    arr.forEach(e -> {
                        JsonObject v = e.getAsJsonObject();
                        listaVehiculos.add(new Vehiculo(
                            v.get("idVehiculo").getAsInt(),
                            getStr(v,"matricula"), getStr(v,"marca"), getStr(v,"modelo"),
                            v.get("anio").getAsInt(), getStr(v,"color"),
                            getStr(v,"fechaEntrada"), getStr(v,"estado"),
                            v.has("precioCompra") && !v.get("precioCompra").isJsonNull() ? v.get("precioCompra").getAsDouble() : 0.0,
                            v.has("kilometraje") && !v.get("kilometraje").isJsonNull() ? v.get("kilometraje").getAsInt() : 0,
                            getStr(v,"ubicacionGps"), getStr(v,"observaciones")));
                    });
                } else {
                    LoggerUtil.error("Error API al cargar vehículos para asignación: " + resp.getStatusCode(), null);
                }
            });
        }).start();
        // No establecer items aquí, se hace en configurarFiltradoVehiculos()
    }

    /**
     * Carga las piezas disponibles en el ComboBox via API
     */
    private void cargarPiezas() {
        listaPiezas.clear();
        new Thread(() -> {
            ApiClient.ApiResponse resp = ApiClient.getInstance().get("/api/piezas");
            Platform.runLater(() -> {
                if (resp.isSuccess()) {
                    JsonArray arr = JsonParser.parseString(resp.getBody()).getAsJsonArray();
                    arr.forEach(e -> {
                        JsonObject p = e.getAsJsonObject();
                        listaPiezas.add(new Pieza(
                            p.get("idPieza").getAsInt(),
                            getStr(p,"codigoPieza"), getStr(p,"nombre"), getStr(p,"categoria"),
                            p.has("precioVenta") && !p.get("precioVenta").isJsonNull() ? p.get("precioVenta").getAsDouble() : 0.0,
                            p.has("stockDisponible") && !p.get("stockDisponible").isJsonNull() ? p.get("stockDisponible").getAsInt() : 0,
                            p.has("stockMinimo") && !p.get("stockMinimo").isJsonNull() ? p.get("stockMinimo").getAsInt() : 1,
                            getStr(p,"ubicacionAlmacen"), getStr(p,"compatibleMarcas"),
                            getStr(p,"imagen"), getStr(p,"descripcion")));
                    });
                } else {
                    LoggerUtil.error("Error API al cargar piezas para asignación: " + resp.getStatusCode(), null);
                }
            });
        }).start();
        // No establecer items aquí, se hace en configurarFiltradoPiezas()
    }

    /**
     * Carga los datos del inventario en el formulario
     */
    private void cargarDatosInventario() {
        if (inventarioEditar != null) {
            // Buscar y seleccionar el vehículo en el ComboBox
            for (Vehiculo v : listaVehiculos) {
                if (v.getIdVehiculo() == inventarioEditar.getIdVehiculo()) {
                    cmbVehiculo.setValue(v);
                    cmbVehiculo.setDisable(true); // No permitir cambiar en edición
                    break;
                }
            }

            // Buscar y seleccionar la pieza en el ComboBox
            for (Pieza p : listaPiezas) {
                if (p.getIdPieza() == inventarioEditar.getIdPieza()) {
                    cmbPieza.setValue(p);
                    cmbPieza.setDisable(true); // No permitir cambiar en edición
                    break;
                }
            }

            txtCantidad.setText(String.valueOf(inventarioEditar.getCantidad()));

            // Seleccionar el estado correspondiente
            String estado = inventarioEditar.getEstadoPieza();
            if ("nueva".equalsIgnoreCase(estado)) {
                rbNuevo.setSelected(true);
            } else if ("usada".equalsIgnoreCase(estado)) {
                rbUsado.setSelected(true);
            } else if ("reparada".equalsIgnoreCase(estado)) {
                rbReparado.setSelected(true);
            }

            txtPrecioMecanico.setText(String.valueOf(inventarioEditar.getPrecioUnitario()));

            // Parsear fecha
            try {
                dpFechaAsignacion.setValue(LocalDate.parse(inventarioEditar.getFechaExtraccion()));
            } catch (Exception e) {
                dpFechaAsignacion.setValue(LocalDate.now());
            }

            txtNotas.setText(inventarioEditar.getNotas());

            // Cambiar texto del botón
            btnAsignar.setText("Actualizar");
        }
    }

    /**
     * Valida todos los campos del formulario
     */
    private boolean validarCampos() {
        StringBuilder errores = new StringBuilder();
        boolean valido = true;

        // Validar vehículo seleccionado
        if (!ValidationUtils.validateComboBox(cmbVehiculo, null, "un vehículo")) {
            errores.append("• Vehículo: Debe seleccionar un vehículo\n");
            valido = false;
        }

        // Validar pieza seleccionada
        if (!ValidationUtils.validateComboBox(cmbPieza, null, "una pieza")) {
            errores.append("• Pieza: Debe seleccionar una pieza\n");
            valido = false;
        }

        // Validar cantidad (entero >= 1)
        if (!ValidationUtils.validateIntegerRange(txtCantidad, null, "Cantidad", 1, 9999)) {
            errores.append("• Cantidad: Debe estar entre 1 y 9999\n");
            valido = false;
        }

        // Validar estado seleccionado
        if (grupoContenedor.getSelectedToggle() == null) {
            errores.append("• Estado: Debe seleccionar Nuevo, Usado o Reparado\n");
            valido = false;
        }

        // Validar precio unitario (decimal >= 0)
        if (!ValidationUtils.validateDoubleMinimum(txtPrecioMecanico, null, "Precio unitario", 0)) {
            errores.append("• Precio unitario: Debe ser un número mayor o igual a 0\n");
            valido = false;
        }

        // Validar fecha
        if (dpFechaAsignacion.getValue() == null) {
            errores.append("• Fecha: Debe seleccionar una fecha de extracción\n");
            valido = false;
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
     * Guarda la asignación de inventario en la base de datos
     */
    private void guardarInventario() {
        // Validar campos (el Alert de errores ya se muestra dentro de validarCampos())
        if (!validarCampos()) {
            return;
        }

        // Obtener valores
        int idVehiculo = cmbVehiculo.getValue().getIdVehiculo();
        int idPieza = cmbPieza.getValue().getIdPieza();
        int cantidad = Integer.parseInt(txtCantidad.getText().trim());

        String estado = "";
        if (rbNuevo.isSelected()) estado = "nueva";
        else if (rbUsado.isSelected()) estado = "usada";
        else if (rbReparado.isSelected()) estado = "reparada";

        double precioUnitario = Double.parseDouble(txtPrecioMecanico.getText().trim().replace(",", "."));
        LocalDate fechaExtraccion = dpFechaAsignacion.getValue();
        String notas = txtNotas.getText().trim();

        JsonObject body = new JsonObject();
        body.addProperty("idVehiculo",       idVehiculo);
        body.addProperty("idPieza",          idPieza);
        body.addProperty("cantidad",         cantidad);
        body.addProperty("estadoPieza",      estado);
        body.addProperty("fechaExtraccion",  fechaExtraccion.toString());
        body.addProperty("precioUnitario",   precioUnitario);
        body.addProperty("notas",            notas);

        btnAsignar.setDisable(true);
        new Thread(() -> {
            ApiClient.ApiResponse resp = modoEdicion
                    ? ApiClient.getInstance().put("/api/inventario/" + idVehiculo + "/" + idPieza, body)
                    : ApiClient.getInstance().post("/api/inventario", body);
            Platform.runLater(() -> {
                btnAsignar.setDisable(false);
                if (resp.isSuccess()) {
                    String mensaje = modoEdicion
                            ? "Asignación actualizada correctamente"
                            : "Pieza asignada correctamente al vehículo";
                    ValidationUtils.showSuccess("Operación exitosa", mensaje);
                    if (controladorPadre != null) controladorPadre.actualizarListado();
                    cerrarVentana();
                } else if (resp.getStatusCode() == 409) {
                    ValidationUtils.showError("Asignación duplicada",
                            "Ya existe esta pieza asignada a este vehículo.\n" +
                            "Use la opción Editar para modificar la cantidad o estado.");
                } else {
                    ValidationUtils.showError("Error al guardar", "Código: " + resp.getStatusCode());
                }
            });
        }).start();
    }

    private String getStr(JsonObject obj, String key) {
        return obj.has(key) && !obj.get(key).isJsonNull() ? obj.get(key).getAsString() : "";
    }

    /**
     * Cierra la ventana del formulario
     */
    private void cerrarVentana() {
        Stage stage = (Stage) btnCancelar.getScene().getWindow();
        stage.close();
    }
}
