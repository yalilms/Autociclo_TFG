package com.autociclo.controllers;

import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.fxml.Initializable;
import javafx.scene.Parent;
import javafx.scene.control.*;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.scene.input.KeyCode;
import javafx.scene.input.MouseButton;
import javafx.scene.layout.StackPane;
import javafx.stage.Stage;
import javafx.scene.image.Image;

import com.autociclo.api.ApiClient;
import com.autociclo.api.SessionManager;
import com.autociclo.models.Vehiculo;
import com.autociclo.models.Pieza;
import com.autociclo.models.InventarioPieza;
import com.autociclo.rabbitmq.RabbitMQListener;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import com.autociclo.utils.ValidationUtils;
import com.autociclo.utils.LoggerUtil;
import com.autociclo.utils.ModalUtils;
import com.autociclo.utils.AppConstants;
import com.autociclo.utils.AppResources;
import com.autociclo.utils.AnimationFactory;
import com.autociclo.utils.ErrorHandler;

import org.kordamp.ikonli.javafx.FontIcon;
import org.kordamp.ikonli.materialdesign2.MaterialDesignA;
import org.kordamp.ikonli.materialdesign2.MaterialDesignC;
import org.kordamp.ikonli.materialdesign2.MaterialDesignD;
import org.kordamp.ikonli.materialdesign2.MaterialDesignE;
import org.kordamp.ikonli.materialdesign2.MaterialDesignF;
import org.kordamp.ikonli.materialdesign2.MaterialDesignM;
import org.kordamp.ikonli.materialdesign2.MaterialDesignP;

import javafx.application.Platform;
import java.net.URL;
import java.util.ResourceBundle;

public class ListadoMaestroController implements Initializable {

    // Icono de la aplicación (singleton)
    private final Image appIcon = AppResources.getIcon();

    // MenuBar
    @FXML
    private MenuItem menuSalir;
    @FXML
    private Menu Menu;
    @FXML
    private MenuItem menuvehiculos;
    @FXML
    private MenuItem menupiezas;
    @FXML
    private MenuItem MenuInventario;
    @FXML
    private MenuItem menuEstadisticas;

    // ToolBar
    @FXML
    private Button btnNuevo;
    @FXML
    private Button btnVer;
    @FXML
    private Button btnEditar;
    @FXML
    private Button btnEliminar;
    @FXML
    private TextField txtBuscar;
    @FXML
    private Button btnBuscar;

    // Navegación
    @FXML private Button btnNavVehiculos;
    @FXML private Button btnNavPiezas;
    @FXML private Button btnNavInventario;
    @FXML private Button btnNavEstadisticas;
    @FXML private Button btnNavUsuarios;
    @FXML private Button btnNavSolicitudes;
    @FXML private Label  lblBadgeNotificaciones;

    // RabbitMQ listener para notificaciones en tiempo real
    private final RabbitMQListener rabbitMQListener = new RabbitMQListener();
    private int contadorNotificaciones = 0;

    // StackPane y TableViews
    @FXML
    private StackPane stackPaneContenido;
    @FXML
    private TableView<Vehiculo> tableVehiculos;
    @FXML
    private TableView<Pieza> tablePiezas;
    @FXML
    private TableView<InventarioPieza> tableInventario;

    // Vistas de módulos auxiliares
    private Parent vistaEstadisticas;
    private EstadisticasController controllerEstadisticas;
    private Parent vistaUsuarios;
    private Parent vistaSolicitudes;
    private UsuariosController controllerUsuarios;
    private SolicitudesController controllerSolicitudes;


    // Columnas TableView Vehiculos
    @FXML
    private TableColumn<Vehiculo, Integer> colVehiculoId;
    @FXML
    private TableColumn<Vehiculo, String> colMarca;
    @FXML
    private TableColumn<Vehiculo, String> colModelo;
    @FXML
    private TableColumn<Vehiculo, Integer> colAnio;
    @FXML
    private TableColumn<Vehiculo, Integer> colKm;
    @FXML
    private TableColumn<Vehiculo, String> colEstado;

    // Columnas TableView Piezas
    @FXML
    private TableColumn<Pieza, Integer> colPiezaId;
    @FXML
    private TableColumn<Pieza, String> colCodigo;
    @FXML
    private TableColumn<Pieza, String> colNombre;
    @FXML
    private TableColumn<Pieza, String> colCategoria;
    @FXML
    private TableColumn<Pieza, Double> colPrecio;
    @FXML
    private TableColumn<Pieza, Integer> colStock;
    @FXML
    private TableColumn<Pieza, String> colUbicacion;

    // Columnas TableView Inventario
    @FXML
    private TableColumn<InventarioPieza, String> colInventarioId;
    @FXML
    private TableColumn<InventarioPieza, String> colProducto;
    @FXML
    private TableColumn<InventarioPieza, Integer> colCantidad;
    @FXML
    private TableColumn<InventarioPieza, String> colFechaIngreso;
    @FXML
    private TableColumn<InventarioPieza, String> colAlmacen;

    // Botones inferior
    @FXML
    private Button btnAnterior;
    @FXML
    private Button btnSiguiente;

    @FXML
    private Label lblErrorConexion;

    // Listas observables
    private ObservableList<Vehiculo> listaVehiculos = FXCollections.observableArrayList();
    private ObservableList<Pieza> listaPiezas = FXCollections.observableArrayList();
    private ObservableList<InventarioPieza> listaInventario = FXCollections.observableArrayList();

    // Listas filtradas para búsqueda
    private ObservableList<Vehiculo> listaVehiculosFiltrada = FXCollections.observableArrayList();
    private ObservableList<Pieza> listaPiezasFiltrada = FXCollections.observableArrayList();
    private ObservableList<InventarioPieza> listaInventarioFiltrada = FXCollections.observableArrayList();

    // Variables de paginación
    private int paginaActual = 0;

    @Override
    public void initialize(URL url, ResourceBundle rb) {
        // Configurar columnas de TableView Vehículos
        colVehiculoId.setCellValueFactory(new PropertyValueFactory<>("idVehiculo"));
        colMarca.setCellValueFactory(new PropertyValueFactory<>("marca"));
        colModelo.setCellValueFactory(new PropertyValueFactory<>("modelo"));
        colAnio.setCellValueFactory(new PropertyValueFactory<>("anio"));
        colKm.setCellValueFactory(new PropertyValueFactory<>("kilometraje"));
        colEstado.setCellValueFactory(new PropertyValueFactory<>("estado"));

        // Configurar columnas de TableView Piezas
        colPiezaId.setCellValueFactory(new PropertyValueFactory<>("idPieza"));
        colCodigo.setCellValueFactory(new PropertyValueFactory<>("codigoPieza"));
        colNombre.setCellValueFactory(new PropertyValueFactory<>("nombre"));
        colCategoria.setCellValueFactory(new PropertyValueFactory<>("categoria"));
        colPrecio.setCellValueFactory(new PropertyValueFactory<>("precioVenta"));
        colStock.setCellValueFactory(new PropertyValueFactory<>("stockDisponible"));
        colUbicacion.setCellValueFactory(new PropertyValueFactory<>("ubicacionAlmacen"));

        // Configurar columnas de TableView Inventario
        colInventarioId.setCellValueFactory(new PropertyValueFactory<>("vehiculoInfo"));
        colProducto.setCellValueFactory(new PropertyValueFactory<>("piezaNombre"));
        colCantidad.setCellValueFactory(new PropertyValueFactory<>("cantidad"));
        colFechaIngreso.setCellValueFactory(new PropertyValueFactory<>("fechaExtraccion"));
        colAlmacen.setCellValueFactory(new PropertyValueFactory<>("estadoPieza"));

        // Cargar datos desde la API REST
        cargarVehiculos();
        cargarPiezas();
        cargarInventario();

        // Mostrar vehículos por defecto al iniciar
        mostrarVehiculos();

        // Configurar botones de paginación
        btnAnterior.setOnAction(event -> paginaAnterior());
        btnSiguiente.setOnAction(event -> paginaSiguiente());
        actualizarBotonesPaginacion();

        // Conectar eventos de botones del toolbar
        btnNuevo.setOnAction(event -> abrirFormularioNuevo());
        btnVer.setOnAction(event -> verDetallesRegistro());
        btnEditar.setOnAction(event -> editarRegistro());
        btnEliminar.setOnAction(event -> eliminarRegistro());

        // Configurar menús
        menuSalir.setOnAction(event -> salirAplicacion());

        // Configurar búsqueda en tiempo real
        configurarBusqueda();

        // Configurar iconos de Ikonli
        configurarIconos();

        // ENTREGA 3: Configurar eventos de teclado y ratón
        configurarEventosTeclado();
        configurarEventosRaton();
        configurarMenusContextuales();

        // ENTREGA 3: Nuevos módulos
        if (btnNavUsuarios != null)
            btnNavUsuarios.setOnAction(e -> mostrarUsuarios());
        if (btnNavSolicitudes != null)
            btnNavSolicitudes.setOnAction(e -> mostrarSolicitudes());

        // ENTREGA 3: Ocultar módulos exclusivos de ADMIN para EMPLEADO
        boolean esAdmin = SessionManager.getInstance().isAdmin();
        if (btnNavUsuarios != null)
            btnNavUsuarios.setVisible(esAdmin);
        if (btnNavEstadisticas != null)
            btnNavEstadisticas.setVisible(esAdmin);
        if (menuEstadisticas != null)
            menuEstadisticas.setVisible(esAdmin);

        // ENTREGA 3: RabbitMQ — escucha cola solicitudes.nueva
        iniciarRabbitMQ();
    }

    private void cargarVehiculos() {
        new Thread(() -> {
            ApiClient.ApiResponse resp = ApiClient.getInstance().get("/api/vehiculos");
            Platform.runLater(() -> {
                listaVehiculos.clear();
                if (resp.isSuccess()) {
                    JsonArray arr = JsonParser.parseString(resp.getBody()).getAsJsonArray();
                    arr.forEach(e -> {
                        JsonObject v = e.getAsJsonObject();
                        listaVehiculos.add(new Vehiculo(
                            v.get("idVehiculo").getAsInt(),
                            getStr(v, "matricula"), getStr(v, "marca"), getStr(v, "modelo"),
                            v.get("anio").getAsInt(), getStr(v, "color"),
                            getStr(v, "fechaEntrada"), getStr(v, "estado"),
                            v.has("precioCompra") && !v.get("precioCompra").isJsonNull() ? v.get("precioCompra").getAsDouble() : 0.0,
                            v.has("kilometraje") && !v.get("kilometraje").isJsonNull() ? v.get("kilometraje").getAsInt() : 0,
                            getStr(v, "ubicacionGps"), getStr(v, "observaciones")));
                    });
                    LoggerUtil.logDatosCargados("Vehículos", listaVehiculos.size());
                    if (lblErrorConexion != null) lblErrorConexion.setVisible(false);
                    if (tableVehiculos.isVisible()) {
                        listaVehiculosFiltrada.setAll(listaVehiculos);
                        actualizarTablaVehiculos();
                    }
                } else {
                    LoggerUtil.error("Error API vehículos: " + resp.getStatusCode(), null);
                    if (lblErrorConexion != null) lblErrorConexion.setVisible(true);
                }
            });
        }).start();
    }

    private void cargarPiezas() {
        new Thread(() -> {
            ApiClient.ApiResponse resp = ApiClient.getInstance().get("/api/piezas");
            Platform.runLater(() -> {
                listaPiezas.clear();
                if (resp.isSuccess()) {
                    JsonArray arr = JsonParser.parseString(resp.getBody()).getAsJsonArray();
                    arr.forEach(e -> {
                        JsonObject p = e.getAsJsonObject();
                        listaPiezas.add(new Pieza(
                            p.get("idPieza").getAsInt(),
                            getStr(p, "codigoPieza"), getStr(p, "nombre"), getStr(p, "categoria"),
                            p.has("precioVenta") && !p.get("precioVenta").isJsonNull() ? p.get("precioVenta").getAsDouble() : 0.0,
                            p.has("stockDisponible") && !p.get("stockDisponible").isJsonNull() ? p.get("stockDisponible").getAsInt() : 0,
                            p.has("stockMinimo") && !p.get("stockMinimo").isJsonNull() ? p.get("stockMinimo").getAsInt() : 1,
                            getStr(p, "ubicacionAlmacen"), getStr(p, "compatibleMarcas"),
                            getStr(p, "imagen"), getStr(p, "descripcion")));
                    });
                    LoggerUtil.logDatosCargados("Piezas", listaPiezas.size());
                    if (lblErrorConexion != null) lblErrorConexion.setVisible(false);
                    if (tablePiezas.isVisible()) {
                        listaPiezasFiltrada.setAll(listaPiezas);
                        actualizarTablaPiezas();
                    }
                } else {
                    LoggerUtil.error("Error API piezas: " + resp.getStatusCode(), null);
                    if (lblErrorConexion != null) lblErrorConexion.setVisible(true);
                }
            });
        }).start();
    }

    private void cargarInventario() {
        new Thread(() -> {
            ApiClient.ApiResponse resp = ApiClient.getInstance().get("/api/inventario");
            Platform.runLater(() -> {
                listaInventario.clear();
                if (resp.isSuccess()) {
                    JsonArray arr = JsonParser.parseString(resp.getBody()).getAsJsonArray();
                    arr.forEach(e -> {
                        JsonObject inv = e.getAsJsonObject();
                        // La API devuelve objetos con vehiculo y pieza anidados
                        String vehiculoInfo = "";
                        String piezaNombre  = "";
                        try {
                            JsonObject veh = inv.getAsJsonObject("vehiculo");
                            vehiculoInfo = veh.get("marca").getAsString() + " " +
                                           veh.get("modelo").getAsString() + " (" +
                                           veh.get("anio").getAsInt() + ")";
                        } catch (Exception ex) { vehiculoInfo = getStr(inv, "idVehiculo"); }
                        try { piezaNombre = inv.getAsJsonObject("pieza").get("nombre").getAsString(); }
                        catch (Exception ex) { piezaNombre = getStr(inv, "idPieza"); }

                        listaInventario.add(new InventarioPieza(
                            inv.has("idVehiculo") ? inv.get("idVehiculo").getAsInt() : 0,
                            inv.has("idPieza")    ? inv.get("idPieza").getAsInt()    : 0,
                            vehiculoInfo, piezaNombre,
                            inv.has("cantidad")       ? inv.get("cantidad").getAsInt()          : 0,
                            getStr(inv, "estadoPieza"),
                            getStr(inv, "fechaExtraccion"),
                            inv.has("precioUnitario") ? inv.get("precioUnitario").getAsDouble()  : 0.0,
                            getStr(inv, "notas")));
                    });
                    LoggerUtil.logDatosCargados("Inventario", listaInventario.size());
                    if (lblErrorConexion != null) lblErrorConexion.setVisible(false);
                    if (tableInventario.isVisible()) {
                        listaInventarioFiltrada.setAll(listaInventario);
                        actualizarTablaInventario();
                    }
                } else {
                    LoggerUtil.error("Error API inventario: " + resp.getStatusCode(), null);
                    if (lblErrorConexion != null) lblErrorConexion.setVisible(true);
                }
            });
        }).start();
    }

    // ─── Nuevos módulos (Entrega 3) ──────────────────────────

    @FXML
    public void mostrarUsuarios() {
        try {
            ocultarTodasLasVistas();
            if (vistaUsuarios == null) {
                FXMLLoader loader = new FXMLLoader(getClass().getResource(AppConstants.FXML_USUARIOS));
                vistaUsuarios = loader.load();
                controllerUsuarios = loader.getController();
                stackPaneContenido.getChildren().add(vistaUsuarios);
            }
            vistaUsuarios.setVisible(true);
            aplicarFadeTransition(vistaUsuarios);
            actualizarEstilosNavegacion(btnNavUsuarios);
            habilitarBotonesCRUD(false);
            actualizarBotonesPaginacion();
        } catch (Exception e) {
            LoggerUtil.error("Error al cargar Usuarios.fxml", e);
        }
    }

    @FXML
    public void mostrarSolicitudes() {
        try {
            ocultarTodasLasVistas();
            if (vistaSolicitudes == null) {
                FXMLLoader loader = new FXMLLoader(getClass().getResource(AppConstants.FXML_SOLICITUDES));
                vistaSolicitudes = loader.load();
                controllerSolicitudes = loader.getController();
                stackPaneContenido.getChildren().add(vistaSolicitudes);
            }
            vistaSolicitudes.setVisible(true);
            aplicarFadeTransition(vistaSolicitudes);
            actualizarEstilosNavegacion(btnNavSolicitudes);
            habilitarBotonesCRUD(false);
            resetearBadge();
            actualizarBotonesPaginacion();
        } catch (Exception e) {
            LoggerUtil.error("Error al cargar Solicitudes.fxml", e);
        }
    }

    // ─── RabbitMQ (Entrega 3) ────────────────────────────────

    private void iniciarRabbitMQ() {
        rabbitMQListener.iniciar(mensaje -> {
            contadorNotificaciones++;
            actualizarBadge(contadorNotificaciones);
        });
    }

    private void actualizarBadge(int count) {
        if (lblBadgeNotificaciones != null) {
            lblBadgeNotificaciones.setText(String.valueOf(count));
            lblBadgeNotificaciones.setVisible(count > 0);
        }
    }

    private void resetearBadge() {
        contadorNotificaciones = 0;
        actualizarBadge(0);
    }

    // ─── Helper JSON ─────────────────────────────────────────

    private String getStr(JsonObject obj, String key) {
        try { return obj.get(key).isJsonNull() ? "" : obj.get(key).getAsString(); }
        catch (Exception e) { return ""; }
    }

    /**
     * Configura la búsqueda en tiempo real para todas las tablas
     */
    private void configurarBusqueda() {
        // Listener para búsqueda en tiempo real
        txtBuscar.textProperty().addListener((observable, oldValue, newValue) -> {
            filtrarTablaActual(newValue);
        });

        // Botón de búsqueda también ejecuta el filtro
        btnBuscar.setOnAction(event -> {
            filtrarTablaActual(txtBuscar.getText());
        });

        // Limpiar búsqueda al presionar ESC
        txtBuscar.setOnKeyPressed(event -> {
            if (event.getCode() == KeyCode.ESCAPE) {
                txtBuscar.clear();
                filtrarTablaActual("");
            }
        });
    }

    /**
     * Configura los iconos de Ikonli para los botones de la aplicación
     */
    private void configurarIconos() {
        // Toolbar
        setIcono(btnNuevo, MaterialDesignP.PLUS_CIRCLE, 16, "Nuevo");
        setIcono(btnVer, MaterialDesignE.EYE, 16, "Ver");
        setIcono(btnEditar, MaterialDesignP.PENCIL, 16, "Editar");
        setIcono(btnEliminar, MaterialDesignD.DELETE, 16, "Eliminar");
        setIcono(btnBuscar, MaterialDesignM.MAGNIFY, 18, "");

        // Navegación
        setIcono(btnNavVehiculos, MaterialDesignC.CAR, 18, "Vehículos");
        setIcono(btnNavPiezas, MaterialDesignC.COG, 18, "Piezas");
        setIcono(btnNavInventario, MaterialDesignC.CLIPBOARD_LIST, 18, "Inventario");
        setIcono(btnNavEstadisticas, MaterialDesignC.CHART_BAR, 18, "Estadísticas");
        if (btnNavUsuarios != null)
            setIcono(btnNavUsuarios, MaterialDesignA.ACCOUNT_GROUP, 18, "Usuarios");
        if (btnNavSolicitudes != null)
            setIcono(btnNavSolicitudes, MaterialDesignF.FILE_DOCUMENT_OUTLINE, 18, "Solicitudes");
    }

    private void setIcono(Button btn, org.kordamp.ikonli.Ikon ikon, int size, String texto) {
        FontIcon icon = new FontIcon(ikon);
        icon.setIconSize(size);
        icon.setIconColor(javafx.scene.paint.Color.WHITE);
        btn.setGraphic(icon);
        btn.setText(texto);
    }

    /**
     * Filtra la tabla actualmente visible según el texto de búsqueda
     */
    private void filtrarTablaActual(String textoBusqueda) {
        String busqueda = textoBusqueda.toLowerCase().trim();

        if (tableVehiculos.isVisible()) {
            filtrarVehiculos(busqueda);
        } else if (tablePiezas.isVisible()) {
            filtrarPiezas(busqueda);
        } else if (tableInventario.isVisible()) {
            filtrarInventario(busqueda);
        }

        // Resetear paginación y actualizar
        paginaActual = 0;
        actualizarBotonesPaginacion();
    }

    /**
     * Filtra la lista de vehículos según el texto de búsqueda
     */
    private void filtrarVehiculos(String busqueda) {
        if (busqueda.isEmpty()) {
            listaVehiculosFiltrada.setAll(listaVehiculos);
        } else {
            listaVehiculosFiltrada.clear();
            for (Vehiculo v : listaVehiculos) {
                if (v.getMarca().toLowerCase().contains(busqueda) ||
                        v.getModelo().toLowerCase().contains(busqueda) ||
                        v.getMatricula().toLowerCase().contains(busqueda) ||
                        v.getColor().toLowerCase().contains(busqueda) ||
                        v.getEstado().toLowerCase().contains(busqueda) ||
                        String.valueOf(v.getAnio()).contains(busqueda)) {
                    listaVehiculosFiltrada.add(v);
                }
            }
        }
        actualizarTablaVehiculos();
    }

    /**
     * Filtra la lista de piezas según el texto de búsqueda
     */
    private void filtrarPiezas(String busqueda) {
        if (busqueda.isEmpty()) {
            listaPiezasFiltrada.setAll(listaPiezas);
        } else {
            listaPiezasFiltrada.clear();
            for (Pieza p : listaPiezas) {
                if (p.getNombre().toLowerCase().contains(busqueda) ||
                        p.getCodigoPieza().toLowerCase().contains(busqueda) ||
                        p.getCategoria().toLowerCase().contains(busqueda) ||
                        p.getUbicacionAlmacen().toLowerCase().contains(busqueda)) {
                    listaPiezasFiltrada.add(p);
                }
            }
        }
        actualizarTablaPiezas();
    }

    /**
     * Filtra la lista de inventario según el texto de búsqueda
     */
    private void filtrarInventario(String busqueda) {
        if (busqueda.isEmpty()) {
            listaInventarioFiltrada.setAll(listaInventario);
        } else {
            listaInventarioFiltrada.clear();
            for (InventarioPieza inv : listaInventario) {
                if (inv.getVehiculoInfo().toLowerCase().contains(busqueda) ||
                        inv.getPiezaNombre().toLowerCase().contains(busqueda) ||
                        inv.getEstadoPieza().toLowerCase().contains(busqueda) ||
                        inv.getFechaExtraccion().toLowerCase().contains(busqueda)) {
                    listaInventarioFiltrada.add(inv);
                }
            }
        }
        actualizarTablaInventario();
    }

    /**
     * Actualiza la tabla de vehículos con la lista filtrada
     */
    private void actualizarTablaVehiculos() {
        int inicio = paginaActual * AppConstants.ITEMS_PER_PAGE;
        int fin = Math.min(inicio + AppConstants.ITEMS_PER_PAGE, listaVehiculosFiltrada.size());

        if (inicio < listaVehiculosFiltrada.size()) {
            tableVehiculos.setItems(FXCollections.observableArrayList(
                    listaVehiculosFiltrada.subList(inicio, fin)));
        } else {
            tableVehiculos.setItems(FXCollections.observableArrayList());
        }
    }

    /**
     * Actualiza la tabla de piezas con la lista filtrada
     */
    private void actualizarTablaPiezas() {
        int inicio = paginaActual * AppConstants.ITEMS_PER_PAGE;
        int fin = Math.min(inicio + AppConstants.ITEMS_PER_PAGE, listaPiezasFiltrada.size());

        if (inicio < listaPiezasFiltrada.size()) {
            tablePiezas.setItems(FXCollections.observableArrayList(
                    listaPiezasFiltrada.subList(inicio, fin)));
        } else {
            tablePiezas.setItems(FXCollections.observableArrayList());
        }
    }

    /**
     * Actualiza la tabla de inventario con la lista filtrada
     */
    private void actualizarTablaInventario() {
        int inicio = paginaActual * AppConstants.ITEMS_PER_PAGE;
        int fin = Math.min(inicio + AppConstants.ITEMS_PER_PAGE, listaInventarioFiltrada.size());

        if (inicio < listaInventarioFiltrada.size()) {
            tableInventario.setItems(FXCollections.observableArrayList(
                    listaInventarioFiltrada.subList(inicio, fin)));
        } else {
            tableInventario.setItems(FXCollections.observableArrayList());
        }
    }

    private void abrirFormularioNuevo() {
        FXMLLoader loader;
        String titulo;

        if (tableVehiculos.isVisible()) {
            loader = ModalUtils.cargarFXML("/fxml/FormularioVehiculo.fxml");
            titulo = "Nuevo Vehículo";
            if (loader != null) ((FormularioVehiculoController) loader.getController()).setControladorPadre(this);
        } else if (tablePiezas.isVisible()) {
            loader = ModalUtils.cargarFXML("/fxml/FormularioPieza.fxml");
            titulo = "Nueva Pieza";
            if (loader != null) ((FormularioPiezaController) loader.getController()).setControladorPadre(this);
        } else if (tableInventario.isVisible()) {
            loader = ModalUtils.cargarFXML("/fxml/AsignarPiezaVehiculo.fxml");
            titulo = "Asignar Pieza a Vehículo";
            if (loader != null) ((AsignarPiezaVehiculoController) loader.getController()).setControladorPadre(this);
        } else {
            return;
        }

        if (loader != null) {
            ModalUtils.mostrarDesdeLoader(loader, titulo, btnNuevo.getScene().getWindow());
        }
    }

    private void editarRegistro() {
        if (tableVehiculos.isVisible()) {
            Vehiculo seleccionado = tableVehiculos.getSelectionModel().getSelectedItem();
            if (!validarSeleccion(seleccionado, "vehículo")) return;

            FXMLLoader loader = ModalUtils.cargarFXML("/fxml/FormularioVehiculo.fxml");
            if (loader != null) {
                FormularioVehiculoController ctrl = loader.getController();
                ctrl.setControladorPadre(this);
                ctrl.setVehiculoEditar(seleccionado);
                ModalUtils.mostrarDesdeLoader(loader, "Editar Vehículo", btnEditar.getScene().getWindow());
            }

        } else if (tablePiezas.isVisible()) {
            Pieza seleccionada = tablePiezas.getSelectionModel().getSelectedItem();
            if (!validarSeleccion(seleccionada, "pieza")) return;

            FXMLLoader loader = ModalUtils.cargarFXML("/fxml/FormularioPieza.fxml");
            if (loader != null) {
                FormularioPiezaController ctrl = loader.getController();
                ctrl.setControladorPadre(this);
                ctrl.setPiezaEditar(seleccionada);
                ModalUtils.mostrarDesdeLoader(loader, "Editar Pieza", btnEditar.getScene().getWindow());
            }

        } else if (tableInventario.isVisible()) {
            InventarioPieza seleccionado = tableInventario.getSelectionModel().getSelectedItem();
            if (!validarSeleccion(seleccionado, "asignación")) return;

            FXMLLoader loader = ModalUtils.cargarFXML("/fxml/AsignarPiezaVehiculo.fxml");
            if (loader != null) {
                AsignarPiezaVehiculoController ctrl = loader.getController();
                ctrl.setControladorPadre(this);
                ctrl.setInventarioEditar(seleccionado);
                ModalUtils.mostrarDesdeLoader(loader, "Editar Asignación", btnEditar.getScene().getWindow());
            }
        }
    }

    /**
     * Elimina el registro seleccionado con confirmación
     */
    private void eliminarRegistro() {
        try {
            if (tableVehiculos.isVisible()) {
                // Eliminar vehículo
                Vehiculo vehiculoSeleccionado = tableVehiculos.getSelectionModel().getSelectedItem();

                if (vehiculoSeleccionado == null) {
                    ValidationUtils.showAlert("Selección requerida",
                            "Por favor seleccione un vehículo",
                            "Debe seleccionar un vehículo de la tabla para eliminarlo",
                            Alert.AlertType.WARNING);
                    return;
                }

                // Confirmar eliminación
                boolean confirmar = ValidationUtils.showConfirmation(
                        "Confirmar eliminación",
                        "¿Está seguro de que desea eliminar este vehículo?",
                        "Vehículo: " + vehiculoSeleccionado.getMarca() + " " +
                                vehiculoSeleccionado.getModelo() + " (" + vehiculoSeleccionado.getMatricula() + ")\n" +
                                "Esta acción no se puede deshacer y eliminará también las piezas asociadas.");

                if (confirmar) {
                    eliminarVehiculo(vehiculoSeleccionado.getIdVehiculo());
                }

            } else if (tablePiezas.isVisible()) {
                // Eliminar pieza
                Pieza piezaSeleccionada = tablePiezas.getSelectionModel().getSelectedItem();

                if (piezaSeleccionada == null) {
                    ValidationUtils.showAlert("Selección requerida",
                            "Por favor seleccione una pieza",
                            "Debe seleccionar una pieza de la tabla para eliminarla",
                            Alert.AlertType.WARNING);
                    return;
                }

                // Confirmar eliminación
                boolean confirmar = ValidationUtils.showConfirmation(
                        "Confirmar eliminación",
                        "¿Está seguro de que desea eliminar esta pieza?",
                        "Pieza: " + piezaSeleccionada.getNombre() + " (" + piezaSeleccionada.getCodigoPieza() + ")\n" +
                                "Esta acción no se puede deshacer y eliminará también las asignaciones en inventario.");

                if (confirmar) {
                    eliminarPieza(piezaSeleccionada.getIdPieza());
                }

            } else if (tableInventario.isVisible()) {
                // Eliminar asignación de inventario
                InventarioPieza inventarioSeleccionado = tableInventario.getSelectionModel().getSelectedItem();

                if (inventarioSeleccionado == null) {
                    ValidationUtils.showAlert("Selección requerida",
                            "Por favor seleccione una asignación",
                            "Debe seleccionar una asignación de la tabla para eliminarla",
                            Alert.AlertType.WARNING);
                    return;
                }

                // Confirmar eliminación
                boolean confirmar = ValidationUtils.showConfirmation(
                        "Confirmar eliminación",
                        "¿Está seguro de que desea eliminar esta asignación?",
                        "Pieza: " + inventarioSeleccionado.getPiezaNombre() + "\n" +
                                "Vehículo: " + inventarioSeleccionado.getVehiculoInfo() + "\n" +
                                "Esta acción no se puede deshacer.");

                if (confirmar) {
                    eliminarInventario(inventarioSeleccionado.getIdVehiculo(), inventarioSeleccionado.getIdPieza());
                }
            }

        } catch (Exception e) {
            LoggerUtil.error("Error al eliminar registro", e);
            ValidationUtils.showError("Error al eliminar",
                    "No se pudo eliminar el registro: " + e.getMessage());
        }
    }

    private void eliminarVehiculo(int idVehiculo) {
        new Thread(() -> {
            ApiClient.ApiResponse resp = ApiClient.getInstance().delete("/api/vehiculos/" + idVehiculo);
            Platform.runLater(() -> {
                if (resp.isSuccess()) {
                    ValidationUtils.showSuccess("Vehículo eliminado", "El vehículo ha sido eliminado correctamente");
                    actualizarListado();
                } else {
                    ValidationUtils.showError("Error al eliminar", "No se pudo eliminar el vehículo (código " + resp.getStatusCode() + ")");
                }
            });
        }).start();
    }

    private void eliminarPieza(int idPieza) {
        new Thread(() -> {
            ApiClient.ApiResponse resp = ApiClient.getInstance().delete("/api/piezas/" + idPieza);
            Platform.runLater(() -> {
                if (resp.isSuccess()) {
                    ValidationUtils.showSuccess("Pieza eliminada", "La pieza ha sido eliminada correctamente");
                    actualizarListado();
                } else {
                    ValidationUtils.showError("Error al eliminar", "No se pudo eliminar la pieza (código " + resp.getStatusCode() + ")");
                }
            });
        }).start();
    }

    private void eliminarInventario(int idVehiculo, int idPieza) {
        new Thread(() -> {
            ApiClient.ApiResponse resp = ApiClient.getInstance().delete("/api/inventario/" + idVehiculo + "/" + idPieza);
            Platform.runLater(() -> {
                if (resp.isSuccess()) {
                    ValidationUtils.showSuccess("Asignación eliminada", "La asignación ha sido eliminada correctamente");
                    actualizarListado();
                } else {
                    ValidationUtils.showError("Error al eliminar", "No se pudo eliminar la asignación (código " + resp.getStatusCode() + ")");
                }
            });
        }).start();
    }

    public void actualizarListado() {
        // Recargar los datos según la tabla visible
        if (tableVehiculos.isVisible()) {
            cargarVehiculos();
            // Actualizar lista filtrada con los nuevos datos
            listaVehiculosFiltrada.setAll(listaVehiculos);
            // Aplicar búsqueda actual si hay texto en el campo
            if (!txtBuscar.getText().isEmpty()) {
                filtrarVehiculos(txtBuscar.getText().toLowerCase().trim());
            }
        } else if (tablePiezas.isVisible()) {
            cargarPiezas();
            // Actualizar lista filtrada con los nuevos datos
            listaPiezasFiltrada.setAll(listaPiezas);
            // Aplicar búsqueda actual si hay texto en el campo
            if (!txtBuscar.getText().isEmpty()) {
                filtrarPiezas(txtBuscar.getText().toLowerCase().trim());
            }
        } else if (tableInventario.isVisible()) {
            cargarInventario();
            // Actualizar lista filtrada con los nuevos datos
            listaInventarioFiltrada.setAll(listaInventario);
            // Aplicar búsqueda actual si hay texto en el campo
            if (!txtBuscar.getText().isEmpty()) {
                filtrarInventario(txtBuscar.getText().toLowerCase().trim());
            }
        } else if (vistaEstadisticas != null && vistaEstadisticas.isVisible()) {
            if (controllerEstadisticas != null) {
                controllerEstadisticas.actualizarDatos();
            }
        }

        // Actualizar tabla paginada después de recargar datos
        actualizarTablaPaginada();
        actualizarBotonesPaginacion();
    }

    // ==================================================================================
    // ENTREGA 3: ANIMACIONES
    // ==================================================================================

    @FXML
    public void mostrarVehiculos() {
        ocultarTodasLasVistas();
        tableVehiculos.setVisible(true);
        txtBuscar.clear();
        listaVehiculosFiltrada.setAll(listaVehiculos);
        reiniciarPaginacion();
        aplicarFadeTransition(tableVehiculos);
        actualizarEstilosNavegacion(btnNavVehiculos);
        habilitarBotonesCRUD(true);
    }

    @FXML
    public void mostrarPiezas() {
        ocultarTodasLasVistas();
        tablePiezas.setVisible(true);
        txtBuscar.clear();
        listaPiezasFiltrada.setAll(listaPiezas);
        reiniciarPaginacion();
        aplicarFadeTransition(tablePiezas);
        actualizarEstilosNavegacion(btnNavPiezas);
        habilitarBotonesCRUD(true);
    }

    @FXML
    public void mostrarInventario() {
        ocultarTodasLasVistas();
        tableInventario.setVisible(true);
        txtBuscar.clear();
        listaInventarioFiltrada.setAll(listaInventario);
        reiniciarPaginacion();
        aplicarFadeTransition(tableInventario);
        actualizarEstilosNavegacion(btnNavInventario);
        habilitarBotonesCRUD(true);
    }

    @FXML
    public void mostrarEstadisticas() {
        ocultarTodasLasVistas();

        try {
            if (vistaEstadisticas == null) {
                FXMLLoader loader = new FXMLLoader(getClass().getResource("/fxml/Estadisticas.fxml"));
                vistaEstadisticas = loader.load();
                controllerEstadisticas = loader.getController();
                stackPaneContenido.getChildren().add(vistaEstadisticas);
            } else if (controllerEstadisticas != null) {
                controllerEstadisticas.actualizarDatos();
            }

            vistaEstadisticas.setVisible(true);
            aplicarFadeTransition(vistaEstadisticas);
        } catch (Exception e) {
            LoggerUtil.error("Error al cargar vista de estadísticas", e);
            ValidationUtils.showError("Error", "No se pudieron cargar las estadísticas: " + e.getMessage());
        }

        actualizarEstilosNavegacion(btnNavEstadisticas);
        habilitarBotonesCRUD(false);
    }


    /**
     * Habilita o deshabilita los botones CRUD del toolbar
     * Se deshabilitan en vistas donde no tienen sentido (Estadísticas, Informes)
     */
    private void habilitarBotonesCRUD(boolean habilitar) {
        btnNuevo.setDisable(!habilitar);
        btnVer.setDisable(!habilitar);
        btnEditar.setDisable(!habilitar);
        btnEliminar.setDisable(!habilitar);
        txtBuscar.setDisable(!habilitar);
        btnBuscar.setDisable(!habilitar);
    }

    private void ocultarTodasLasVistas() {
        tableVehiculos.setVisible(false);
        tablePiezas.setVisible(false);
        tableInventario.setVisible(false);
        if (vistaEstadisticas != null) vistaEstadisticas.setVisible(false);
        if (vistaUsuarios     != null) vistaUsuarios.setVisible(false);
        if (vistaSolicitudes  != null) vistaSolicitudes.setVisible(false);
    }

    private void actualizarEstilosNavegacion(Button botonActivo) {
        Button[] botones = {btnNavVehiculos, btnNavPiezas, btnNavInventario, btnNavEstadisticas, btnNavUsuarios, btnNavSolicitudes};
        for (Button btn : botones) {
            if (btn != null) {
                btn.getStyleClass().clear();
                btn.getStyleClass().add("button");
                if (btn == botonActivo) {
                    btn.getStyleClass().add("button-primary");
                }
            }
        }
    }

    private void aplicarFadeTransition(javafx.scene.Node nodo) {
        AnimationFactory.playFadeIn(nodo);
    }

    // ==================================================================================
    // ENTREGA 3: EVENTOS DE TECLADO
    // ==================================================================================

    private void configurarEventosTeclado() {
        // Handler compartido para las tablas
        javafx.event.EventHandler<javafx.scene.input.KeyEvent> tablaKeyHandler = event -> {
            switch (event.getCode()) {
                case E -> editarRegistro();
                case DELETE -> eliminarRegistro();
                case F5 -> actualizarListado();
                case N -> { if (event.isControlDown()) abrirFormularioNuevo(); }
                default -> {}
            }
        };

        tableVehiculos.setOnKeyPressed(tablaKeyHandler);
        tablePiezas.setOnKeyPressed(tablaKeyHandler);
        tableInventario.setOnKeyPressed(tablaKeyHandler);

        txtBuscar.setOnKeyPressed(event -> {
            if (event.getCode() == KeyCode.ENTER) realizarBusqueda();
        });
    }

    /**
     * Realiza búsqueda en la tabla visible
     */
    private void realizarBusqueda() {
        String textoBusqueda = txtBuscar.getText().toLowerCase().trim();

        if (textoBusqueda.isEmpty()) {
            // Si está vacío, mostrar todos
            actualizarListado();
            return;
        }

        if (tableVehiculos.isVisible()) {
            ObservableList<Vehiculo> filtrados = FXCollections.observableArrayList();
            for (Vehiculo v : listaVehiculos) {
                if (v.getMatricula().toLowerCase().contains(textoBusqueda) ||
                        v.getMarca().toLowerCase().contains(textoBusqueda) ||
                        v.getModelo().toLowerCase().contains(textoBusqueda)) {
                    filtrados.add(v);
                }
            }
            tableVehiculos.setItems(filtrados);
        } else if (tablePiezas.isVisible()) {
            ObservableList<Pieza> filtrados = FXCollections.observableArrayList();
            for (Pieza p : listaPiezas) {
                if (p.getCodigoPieza().toLowerCase().contains(textoBusqueda) ||
                        p.getNombre().toLowerCase().contains(textoBusqueda) ||
                        p.getCategoria().toLowerCase().contains(textoBusqueda)) {
                    filtrados.add(p);
                }
            }
            tablePiezas.setItems(filtrados);
        } else if (tableInventario.isVisible()) {
            ObservableList<InventarioPieza> filtrados = FXCollections.observableArrayList();
            for (InventarioPieza inv : listaInventario) {
                if (inv.getVehiculoInfo().toLowerCase().contains(textoBusqueda) ||
                        inv.getPiezaNombre().toLowerCase().contains(textoBusqueda)) {
                    filtrados.add(inv);
                }
            }
            tableInventario.setItems(filtrados);
        }
    }

    // ==================================================================================
    // ENTREGA 3: EVENTOS DE RATÓN (DOBLE CLIC)
    // ==================================================================================

    private void configurarEventosRaton() {
        configurarDobleClicEditar(tableVehiculos);
        configurarDobleClicEditar(tablePiezas);
        configurarDobleClicEditar(tableInventario);
    }

    private void configurarDobleClicEditar(TableView<?> tabla) {
        tabla.setOnMouseClicked(event -> {
            if (event.getButton() == MouseButton.PRIMARY && event.getClickCount() == 2
                    && tabla.getSelectionModel().getSelectedItem() != null) {
                editarRegistro();
            }
        });
    }

    // ==================================================================================
    // ENTREGA 3: MENÚS CONTEXTUALES
    // ==================================================================================

    /**
     * Configura menús contextuales para las tres tablas
     */
    private void configurarMenusContextuales() {
        // Menú contextual para Vehículos
        ContextMenu menuVehiculos = crearMenuContextual();
        tableVehiculos.setContextMenu(menuVehiculos);

        // Menú contextual para Piezas
        ContextMenu menuPiezas = crearMenuContextual();
        tablePiezas.setContextMenu(menuPiezas);

        // Menú contextual para Inventario
        ContextMenu menuInventario = crearMenuContextual();
        tableInventario.setContextMenu(menuInventario);

        // Menú contextual para campos de texto
        ContextMenu menuTexto = crearMenuContextualTexto();
        txtBuscar.setContextMenu(menuTexto);
    }

    /**
     * Crea un menú contextual genérico para las tablas
     */
    private ContextMenu crearMenuContextual() {
        ContextMenu contextMenu = new ContextMenu();

        // Opción: Nuevo
        MenuItem itemNuevo = new MenuItem("➕ Nuevo");
        itemNuevo.setOnAction(e -> abrirFormularioNuevo());

        // Opción: Editar
        MenuItem itemEditar = new MenuItem("✏ Editar");
        itemEditar.setOnAction(e -> editarRegistro());

        // Opción: Eliminar
        MenuItem itemEliminar = new MenuItem("🗑 Eliminar");
        itemEliminar.setOnAction(e -> eliminarRegistro());

        // Separador
        SeparatorMenuItem separador = new SeparatorMenuItem();

        // Opción: Actualizar
        MenuItem itemActualizar = new MenuItem("🔄 Actualizar");
        itemActualizar.setOnAction(e -> {
            actualizarListado();
        });

        contextMenu.getItems().addAll(itemNuevo, itemEditar, itemEliminar, separador, itemActualizar);
        return contextMenu;
    }

    /**
     * Crea un menú contextual para campos de texto
     */
    private ContextMenu crearMenuContextualTexto() {
        ContextMenu contextMenu = new ContextMenu();

        // Opción: Copiar
        MenuItem itemCopiar = new MenuItem("📋 Copiar");
        itemCopiar.setOnAction(e -> txtBuscar.copy());

        // Opción: Pegar
        MenuItem itemPegar = new MenuItem("📌 Pegar");
        itemPegar.setOnAction(e -> txtBuscar.paste());

        // Opción: Cortar
        MenuItem itemCortar = new MenuItem("✂ Cortar");
        itemCortar.setOnAction(e -> txtBuscar.cut());

        // Separador
        SeparatorMenuItem separador = new SeparatorMenuItem();

        // Opción: Seleccionar todo
        MenuItem itemSeleccionar = new MenuItem("🔘 Seleccionar todo");
        itemSeleccionar.setOnAction(e -> txtBuscar.selectAll());

        // Opción: Limpiar
        MenuItem itemLimpiar = new MenuItem("🧹 Limpiar");
        itemLimpiar.setOnAction(e -> {
            txtBuscar.clear();
            actualizarListado();
        });

        contextMenu.getItems().addAll(itemCopiar, itemPegar, itemCortar, separador, itemSeleccionar, itemLimpiar);
        return contextMenu;
    }

    // ==================================================================================
    // PAGINACIÓN CON ANIMACIONES
    // ==================================================================================

    /**
     * Avanza a la página siguiente con animación
     */
    private void paginaSiguiente() {
        if (vistaUsuarios != null && vistaUsuarios.isVisible() && controllerUsuarios != null) {
            controllerUsuarios.paginaSiguiente();
            actualizarBotonesPaginacion();
            return;
        }
        if (vistaSolicitudes != null && vistaSolicitudes.isVisible() && controllerSolicitudes != null) {
            controllerSolicitudes.paginaSiguiente();
            actualizarBotonesPaginacion();
            return;
        }
        int totalPaginas = calcularTotalPaginas();
        if (paginaActual < totalPaginas - 1) {
            paginaActual++;
            aplicarAnimacionCambioPagina(true);
            actualizarTablaPaginada();
            actualizarBotonesPaginacion();
        }
    }

    private void paginaAnterior() {
        if (vistaUsuarios != null && vistaUsuarios.isVisible() && controllerUsuarios != null) {
            controllerUsuarios.paginaAnterior();
            actualizarBotonesPaginacion();
            return;
        }
        if (vistaSolicitudes != null && vistaSolicitudes.isVisible() && controllerSolicitudes != null) {
            controllerSolicitudes.paginaAnterior();
            actualizarBotonesPaginacion();
            return;
        }
        if (paginaActual > 0) {
            paginaActual--;
            aplicarAnimacionCambioPagina(false);
            actualizarTablaPaginada();
            actualizarBotonesPaginacion();
        }
    }

    /**
     * Calcula el número total de páginas según la tabla visible
     */
    private int calcularTotalPaginas() {
        int totalElementos = 0;

        if (tableVehiculos.isVisible()) {
            totalElementos = listaVehiculosFiltrada.size();
        } else if (tablePiezas.isVisible()) {
            totalElementos = listaPiezasFiltrada.size();
        } else if (tableInventario.isVisible()) {
            totalElementos = listaInventarioFiltrada.size();
        }

        return (int) Math.ceil((double) totalElementos / AppConstants.ITEMS_PER_PAGE);
    }

    /**
     * Actualiza la tabla visible con los elementos de la página actual
     */
    private void actualizarTablaPaginada() {
        int inicio = paginaActual * AppConstants.ITEMS_PER_PAGE;
        int fin = Math.min(inicio + AppConstants.ITEMS_PER_PAGE, obtenerTotalElementosActual());

        if (tableVehiculos.isVisible()) {
            ObservableList<Vehiculo> paginaActualLista = FXCollections.observableArrayList(
                    listaVehiculosFiltrada.subList(inicio, fin));
            tableVehiculos.setItems(paginaActualLista);
        } else if (tablePiezas.isVisible()) {
            ObservableList<Pieza> paginaActualLista = FXCollections.observableArrayList(
                    listaPiezasFiltrada.subList(inicio, fin));
            tablePiezas.setItems(paginaActualLista);
        } else if (tableInventario.isVisible()) {
            ObservableList<InventarioPieza> paginaActualLista = FXCollections.observableArrayList(
                    listaInventarioFiltrada.subList(inicio, fin));
            tableInventario.setItems(paginaActualLista);
        }
    }

    /**
     * Obtiene el total de elementos de la lista visible
     */
    private int obtenerTotalElementosActual() {
        if (tableVehiculos.isVisible()) {
            return listaVehiculosFiltrada.size();
        } else if (tablePiezas.isVisible()) {
            return listaPiezasFiltrada.size();
        } else if (tableInventario.isVisible()) {
            return listaInventarioFiltrada.size();
        }
        return 0;
    }

    /**
     * Actualiza el estado de los botones de paginación (habilitado/deshabilitado)
     */
    private void actualizarBotonesPaginacion() {
        if (vistaUsuarios != null && vistaUsuarios.isVisible() && controllerUsuarios != null) {
            btnAnterior.setDisable(!controllerUsuarios.hayPaginaAnterior());
            btnSiguiente.setDisable(!controllerUsuarios.hayPaginaSiguiente());
            return;
        }
        if (vistaSolicitudes != null && vistaSolicitudes.isVisible() && controllerSolicitudes != null) {
            btnAnterior.setDisable(!controllerSolicitudes.hayPaginaAnterior());
            btnSiguiente.setDisable(!controllerSolicitudes.hayPaginaSiguiente());
            return;
        }
        int totalPaginas = calcularTotalPaginas();
        btnAnterior.setDisable(paginaActual == 0);
        btnSiguiente.setDisable(paginaActual >= totalPaginas - 1 || totalPaginas == 0);
    }

    private void aplicarAnimacionCambioPagina(boolean adelante) {
        TableView<?> tablaVisible = obtenerTablaVisible();
        if (tablaVisible != null) {
            AnimationFactory.playPageChangeAnimation(tablaVisible, null);
        }
    }

    /**
     * Obtiene la tabla actualmente visible
     */
    private TableView<?> obtenerTablaVisible() {
        if (tableVehiculos.isVisible()) {
            return tableVehiculos;
        } else if (tablePiezas.isVisible()) {
            return tablePiezas;
        } else if (tableInventario.isVisible()) {
            return tableInventario;
        }
        return null;
    }

    /**
     * Reinicia la paginación al cambiar de tabla
     */
    private void reiniciarPaginacion() {
        paginaActual = 0;
        actualizarTablaPaginada();
        actualizarBotonesPaginacion();
    }

    /**
     * Cierra la aplicación después de pedir confirmación
     */
    private void salirAplicacion() {
        Alert alert = new Alert(Alert.AlertType.CONFIRMATION);
        alert.setTitle("Salir de AutoCiclo");
        alert.setHeaderText("¿Está seguro que desea salir?");
        alert.setContentText("Se cerrará la aplicación AutoCiclo - Gestión de Desguace");

        // Aplicar estilos y añadir icono usando setOnShowing
        alert.getDialogPane().getStylesheets().add(
                getClass().getResource("/css/styles.css").toExternalForm());
        alert.getDialogPane().getStyleClass().add("glass-pane");
        alert.setOnShowing(e -> {
            Stage alertStage = (Stage) alert.getDialogPane().getScene().getWindow();
            if (alertStage != null) {
                alertStage.getIcons().add(appIcon);
            }
        });

        alert.showAndWait().ifPresent(response -> {
            if (response == ButtonType.OK) {
                // Cerrar la ventana actual
                Stage stage = (Stage) tableVehiculos.getScene().getWindow();
                stage.close();

                // Cerrar la aplicación completamente
                System.exit(0);
            }
        });
    }


    private void verDetallesRegistro() {
        if (tableVehiculos.isVisible()) {
            verDetallesVehiculo();
        } else if (tablePiezas.isVisible()) {
            verDetallesPieza();
        } else if (tableInventario.isVisible()) {
            verDetallesInventario();
        }
    }

    private void verDetallesVehiculo() {
        Vehiculo seleccionado = tableVehiculos.getSelectionModel().getSelectedItem();
        if (!validarSeleccion(seleccionado, "vehículo")) return;

        FXMLLoader loader = ModalUtils.cargarFXML("/fxml/DetalleVehiculo.fxml");
        if (loader != null) {
            DetalleVehiculoController controller = loader.getController();
            controller.setVehiculo(seleccionado);
            ModalUtils.mostrarDesdeLoader(loader, "Detalles del Vehículo", btnVer.getScene().getWindow());
        }
    }

    private void verDetallesPieza() {
        Pieza seleccionada = tablePiezas.getSelectionModel().getSelectedItem();
        if (!validarSeleccion(seleccionada, "pieza")) return;

        FXMLLoader loader = ModalUtils.cargarFXML("/fxml/DetallePieza.fxml");
        if (loader != null) {
            DetallePiezaController controller = loader.getController();
            controller.setPieza(seleccionada);
            ModalUtils.mostrarDesdeLoader(loader, "Detalles de la Pieza", btnVer.getScene().getWindow());
        }
    }

    private void verDetallesInventario() {
        InventarioPieza seleccionado = tableInventario.getSelectionModel().getSelectedItem();
        if (!validarSeleccion(seleccionado, "registro de inventario")) return;

        FXMLLoader loader = ModalUtils.cargarFXML("/fxml/DetalleInventario.fxml");
        if (loader != null) {
            DetalleInventarioController controller = loader.getController();
            controller.setInventario(seleccionado);
            ModalUtils.mostrarDesdeLoader(loader, "Detalles del Inventario", btnVer.getScene().getWindow());
        }
    }

    private boolean validarSeleccion(Object seleccionado, String tipo) {
        if (seleccionado == null) {
            ValidationUtils.showAlert("Selección requerida",
                    "Por favor seleccione un " + tipo,
                    "Debe seleccionar un " + tipo + " de la tabla",
                    Alert.AlertType.WARNING);
            return false;
        }
        return true;
    }
}
