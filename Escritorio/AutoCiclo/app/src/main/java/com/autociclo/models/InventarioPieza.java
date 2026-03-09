package com.autociclo.models;

import javafx.beans.property.*;

public class InventarioPieza {
    private final IntegerProperty idVehiculo;
    private final IntegerProperty idPieza;
    private final StringProperty vehiculoInfo;
    private final StringProperty piezaNombre;
    private final IntegerProperty cantidad;
    private final StringProperty estadoPieza;
    private final StringProperty fechaExtraccion;
    private final DoubleProperty precioUnitario;
    private final StringProperty notas;

    // Constructor vacío
    public InventarioPieza() {
        this(0, 0, "", "", 0, "", "", 0.0, "");
    }

    // Constructor completo
    public InventarioPieza(int idVehiculo, int idPieza, String vehiculoInfo, String piezaNombre,
                          int cantidad, String estadoPieza, String fechaExtraccion,
                          double precioUnitario, String notas) {
        this.idVehiculo = new SimpleIntegerProperty(idVehiculo);
        this.idPieza = new SimpleIntegerProperty(idPieza);
        this.vehiculoInfo = new SimpleStringProperty(vehiculoInfo);
        this.piezaNombre = new SimpleStringProperty(piezaNombre);
        this.cantidad = new SimpleIntegerProperty(cantidad);
        this.estadoPieza = new SimpleStringProperty(estadoPieza);
        this.fechaExtraccion = new SimpleStringProperty(fechaExtraccion);
        this.precioUnitario = new SimpleDoubleProperty(precioUnitario);
        this.notas = new SimpleStringProperty(notas);
    }

    // Getters para propiedades
    public IntegerProperty idVehiculoProperty() { return idVehiculo; }
    public IntegerProperty idPiezaProperty() { return idPieza; }
    public StringProperty vehiculoInfoProperty() { return vehiculoInfo; }
    public StringProperty piezaNombreProperty() { return piezaNombre; }
    public IntegerProperty cantidadProperty() { return cantidad; }
    public StringProperty estadoPiezaProperty() { return estadoPieza; }
    public StringProperty fechaExtraccionProperty() { return fechaExtraccion; }
    public DoubleProperty precioUnitarioProperty() { return precioUnitario; }
    public StringProperty notasProperty() { return notas; }

    // Getters para valores
    public int getIdVehiculo() { return idVehiculo.get(); }
    public int getIdPieza() { return idPieza.get(); }
    public String getVehiculoInfo() { return vehiculoInfo.get(); }
    public String getPiezaNombre() { return piezaNombre.get(); }
    public int getCantidad() { return cantidad.get(); }
    public String getEstadoPieza() { return estadoPieza.get(); }
    public String getFechaExtraccion() { return fechaExtraccion.get(); }
    public double getPrecioUnitario() { return precioUnitario.get(); }
    public String getNotas() { return notas.get(); }

    // Setters
    public void setIdVehiculo(int value) { idVehiculo.set(value); }
    public void setIdPieza(int value) { idPieza.set(value); }
    public void setVehiculoInfo(String value) { vehiculoInfo.set(value); }
    public void setPiezaNombre(String value) { piezaNombre.set(value); }
    public void setCantidad(int value) { cantidad.set(value); }
    public void setEstadoPieza(String value) { estadoPieza.set(value); }
    public void setFechaExtraccion(String value) { fechaExtraccion.set(value); }
    public void setPrecioUnitario(double value) { precioUnitario.set(value); }
    public void setNotas(String value) { notas.set(value); }
}
