package com.autociclo.controllers;

import com.autociclo.database.ConexionBD;
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

import java.net.URL;
import java.sql.*;
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
     * Carga los vehículos disponibles en el ComboBox
     */
    private void cargarVehiculos() {
        listaVehiculos.clear();
        String sql = "SELECT * FROM VEHICULOS ORDER BY matricula";

        try (Connection conn = ConexionBD.getConexion();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                Vehiculo v = new Vehiculo(
                    rs.getInt("id_vehiculo"),
                    rs.getString("matricula"),
                    rs.getString("marca"),
                    rs.getString("modelo"),
                    rs.getInt("anio"),
                    rs.getString("color"),
                    rs.getString("fecha_entrada"),
                    rs.getString("estado"),
                    rs.getDouble("precio_compra"),
                    rs.getInt("kilometraje"),
                    rs.getString("ubicacion_gps"),
                    rs.getString("observaciones")
                );
                listaVehiculos.add(v);
            }

            // No establecer items aquí, se hace en configurarFiltradoVehiculos()

        } catch (Exception e) {
            LoggerUtil.error("Error al cargar vehículos para asignación", e);
        }
    }

    /**
     * Carga las piezas disponibles en el ComboBox
     */
    private void cargarPiezas() {
        listaPiezas.clear();
        String sql = "SELECT * FROM PIEZAS ORDER BY codigo_pieza";

        try (Connection conn = ConexionBD.getConexion();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                Pieza p = new Pieza(
                    rs.getInt("id_pieza"),
                    rs.getString("codigo_pieza"),
                    rs.getString("nombre"),
                    rs.getString("categoria"),
                    rs.getDouble("precio_venta"),
                    rs.getInt("stock_disponible"),
                    rs.getInt("stock_minimo"),
                    rs.getString("ubicacion_almacen"),
                    rs.getString("compatible_marcas"),
                    rs.getString("imagen"),
                    rs.getString("descripcion")
                );
                listaPiezas.add(p);
            }

            // No establecer items aquí, se hace en configurarFiltradoPiezas()

        } catch (Exception e) {
            LoggerUtil.error("Error al cargar piezas para asignación", e);
        }
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

        // Comprobar si ya existe la asignación (solo en modo inserción)
        if (!modoEdicion && existeAsignacion(idVehiculo, idPieza)) {
            ValidationUtils.showError("Asignación duplicada",
                "Ya existe esta pieza asignada a este vehículo.\n" +
                "Use la opción Editar para modificar la cantidad o estado.");
            return;
        }

        try (Connection conn = ConexionBD.getConexion()) {
            String sql;

            if (modoEdicion) {
                // UPDATE con PreparedStatement (antiinyección SQL)
                sql = "UPDATE INVENTARIO_PIEZAS SET cantidad=?, estado_pieza=?, " +
                      "fecha_extraccion=?, precio_unitario=?, notas=? " +
                      "WHERE id_vehiculo=? AND id_pieza=?";
            } else {
                // INSERT con PreparedStatement (antiinyección SQL)
                sql = "INSERT INTO INVENTARIO_PIEZAS (id_vehiculo, id_pieza, cantidad, " +
                      "estado_pieza, fecha_extraccion, precio_unitario, notas) " +
                      "VALUES (?, ?, ?, ?, ?, ?, ?)";
            }

            PreparedStatement pstmt = conn.prepareStatement(sql);

            if (modoEdicion) {
                // UPDATE: asignar parámetros
                pstmt.setInt(1, cantidad);
                pstmt.setString(2, estado);
                pstmt.setDate(3, Date.valueOf(fechaExtraccion));
                pstmt.setDouble(4, precioUnitario);
                pstmt.setString(5, notas);
                pstmt.setInt(6, idVehiculo);
                pstmt.setInt(7, idPieza);
            } else {
                // INSERT: asignar parámetros
                pstmt.setInt(1, idVehiculo);
                pstmt.setInt(2, idPieza);
                pstmt.setInt(3, cantidad);
                pstmt.setString(4, estado);
                pstmt.setDate(5, Date.valueOf(fechaExtraccion));
                pstmt.setDouble(6, precioUnitario);
                pstmt.setString(7, notas);
            }

            int filasAfectadas = pstmt.executeUpdate();

            if (filasAfectadas > 0) {
                String mensaje = modoEdicion ?
                    "Asignación actualizada correctamente" :
                    "Pieza asignada correctamente al vehículo";

                ValidationUtils.showSuccess("Operación exitosa", mensaje);

                // Actualizar el listado del controlador padre
                if (controladorPadre != null) {
                    controladorPadre.actualizarListado();
                }

                // Cerrar ventana
                cerrarVentana();
            }

        } catch (SQLException e) {
            LoggerUtil.error("Error al guardar asignación de pieza a vehículo", e);
            ValidationUtils.showError("Error de base de datos",
                "No se pudo guardar la asignación: " + e.getMessage());
        } catch (NumberFormatException e) {
            LoggerUtil.warning("Error de formato en campos numéricos de asignación");
            ValidationUtils.showError("Error de formato",
                "Verifique que los campos numéricos tengan el formato correcto");
        }
    }

    /**
     * Comprueba si ya existe la asignación de esa pieza a ese vehículo
     */
    private boolean existeAsignacion(int idVehiculo, int idPieza) {
        try (Connection conn = ConexionBD.getConexion()) {
            String sql = "SELECT COUNT(*) FROM INVENTARIO_PIEZAS WHERE id_vehiculo = ? AND id_pieza = ?";
            PreparedStatement pstmt = conn.prepareStatement(sql);
            pstmt.setInt(1, idVehiculo);
            pstmt.setInt(2, idPieza);

            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                return rs.getInt(1) > 0;
            }
        } catch (SQLException e) {
            LoggerUtil.error("Error al verificar asignación existente", e);
        }
        return false;
    }

    /**
     * Cierra la ventana del formulario
     */
    private void cerrarVentana() {
        Stage stage = (Stage) btnCancelar.getScene().getWindow();
        stage.close();
    }
}
