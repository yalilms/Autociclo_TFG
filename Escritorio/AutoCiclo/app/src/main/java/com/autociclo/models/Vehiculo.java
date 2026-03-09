package com.autociclo.models;

import javafx.beans.property.*;

public class Vehiculo {
    private final IntegerProperty idVehiculo;
    private final StringProperty matricula;
    private final StringProperty marca;
    private final StringProperty modelo;
    private final IntegerProperty anio;
    private final StringProperty color;
    private final StringProperty fechaEntrada;
    private final StringProperty estado;
    private final DoubleProperty precioCompra;
    private final IntegerProperty kilometraje;
    private final StringProperty ubicacionGps;
    private final StringProperty observaciones;

    // Constructor vacío
    public Vehiculo() {
        this(0, "", "", "", 0, "", "", "", 0.0, 0, "", "");
    }

    // Constructor completo
    public Vehiculo(int idVehiculo, String matricula, String marca, String modelo, int anio,
                   String color, String fechaEntrada, String estado, double precioCompra,
                   int kilometraje, String ubicacionGps, String observaciones) {
        this.idVehiculo = new SimpleIntegerProperty(idVehiculo);
        this.matricula = new SimpleStringProperty(matricula);
        this.marca = new SimpleStringProperty(marca);
        this.modelo = new SimpleStringProperty(modelo);
        this.anio = new SimpleIntegerProperty(anio);
        this.color = new SimpleStringProperty(color);
        this.fechaEntrada = new SimpleStringProperty(fechaEntrada);
        this.estado = new SimpleStringProperty(estado);
        this.precioCompra = new SimpleDoubleProperty(precioCompra);
        this.kilometraje = new SimpleIntegerProperty(kilometraje);
        this.ubicacionGps = new SimpleStringProperty(ubicacionGps);
        this.observaciones = new SimpleStringProperty(observaciones);
    }

    // Getters para propiedades
    public IntegerProperty idVehiculoProperty() { return idVehiculo; }
    public StringProperty matriculaProperty() { return matricula; }
    public StringProperty marcaProperty() { return marca; }
    public StringProperty modeloProperty() { return modelo; }
    public IntegerProperty anioProperty() { return anio; }
    public StringProperty colorProperty() { return color; }
    public StringProperty fechaEntradaProperty() { return fechaEntrada; }
    public StringProperty estadoProperty() { return estado; }
    public DoubleProperty precioCompraProperty() { return precioCompra; }
    public IntegerProperty kilometrajeProperty() { return kilometraje; }
    public StringProperty ubicacionGpsProperty() { return ubicacionGps; }
    public StringProperty observacionesProperty() { return observaciones; }

    // Getters para valores
    public int getIdVehiculo() { return idVehiculo.get(); }
    public String getMatricula() { return matricula.get(); }
    public String getMarca() { return marca.get(); }
    public String getModelo() { return modelo.get(); }
    public int getAnio() { return anio.get(); }
    public String getColor() { return color.get(); }
    public String getFechaEntrada() { return fechaEntrada.get(); }
    public String getEstado() { return estado.get(); }
    public double getPrecioCompra() { return precioCompra.get(); }
    public int getKilometraje() { return kilometraje.get(); }
    public String getUbicacionGps() { return ubicacionGps.get(); }
    public String getObservaciones() { return observaciones.get(); }

    // Setters
    public void setIdVehiculo(int value) { idVehiculo.set(value); }
    public void setMatricula(String value) { matricula.set(value); }
    public void setMarca(String value) { marca.set(value); }
    public void setModelo(String value) { modelo.set(value); }
    public void setAnio(int value) { anio.set(value); }
    public void setColor(String value) { color.set(value); }
    public void setFechaEntrada(String value) { fechaEntrada.set(value); }
    public void setEstado(String value) { estado.set(value); }
    public void setPrecioCompra(double value) { precioCompra.set(value); }
    public void setKilometraje(int value) { kilometraje.set(value); }
    public void setUbicacionGps(String value) { ubicacionGps.set(value); }
    public void setObservaciones(String value) { observaciones.set(value); }

    @Override
    public String toString() {
        return marca.get() + " " + modelo.get() + " (" + anio.get() + ") - " + matricula.get();
    }
}
