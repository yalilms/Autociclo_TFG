package com.autociclo.models;

import javafx.beans.property.*;

public class Pieza {
    private final IntegerProperty idPieza;
    private final StringProperty codigoPieza;
    private final StringProperty nombre;
    private final StringProperty categoria;
    private final DoubleProperty precioVenta;
    private final IntegerProperty stockDisponible;
    private final IntegerProperty stockMinimo;
    private final StringProperty ubicacionAlmacen;
    private final StringProperty compatibleMarcas;
    private final StringProperty imagen;
    private final StringProperty descripcion;

    // Constructor vacío
    public Pieza() {
        this(0, "", "", "", 0.0, 0, 1, "", "", "", "");
    }

    // Constructor completo
    public Pieza(int idPieza, String codigoPieza, String nombre, String categoria,
                double precioVenta, int stockDisponible, int stockMinimo,
                String ubicacionAlmacen, String compatibleMarcas, String imagen, String descripcion) {
        this.idPieza = new SimpleIntegerProperty(idPieza);
        this.codigoPieza = new SimpleStringProperty(codigoPieza);
        this.nombre = new SimpleStringProperty(nombre);
        this.categoria = new SimpleStringProperty(categoria);
        this.precioVenta = new SimpleDoubleProperty(precioVenta);
        this.stockDisponible = new SimpleIntegerProperty(stockDisponible);
        this.stockMinimo = new SimpleIntegerProperty(stockMinimo);
        this.ubicacionAlmacen = new SimpleStringProperty(ubicacionAlmacen);
        this.compatibleMarcas = new SimpleStringProperty(compatibleMarcas);
        this.imagen = new SimpleStringProperty(imagen);
        this.descripcion = new SimpleStringProperty(descripcion);
    }

    // Getters para propiedades
    public IntegerProperty idPiezaProperty() { return idPieza; }
    public StringProperty codigoPiezaProperty() { return codigoPieza; }
    public StringProperty nombreProperty() { return nombre; }
    public StringProperty categoriaProperty() { return categoria; }
    public DoubleProperty precioVentaProperty() { return precioVenta; }
    public IntegerProperty stockDisponibleProperty() { return stockDisponible; }
    public IntegerProperty stockMinimoProperty() { return stockMinimo; }
    public StringProperty ubicacionAlmacenProperty() { return ubicacionAlmacen; }
    public StringProperty compatibleMarcasProperty() { return compatibleMarcas; }
    public StringProperty imagenProperty() { return imagen; }
    public StringProperty descripcionProperty() { return descripcion; }

    // Getters para valores
    public int getIdPieza() { return idPieza.get(); }
    public String getCodigoPieza() { return codigoPieza.get(); }
    public String getNombre() { return nombre.get(); }
    public String getCategoria() { return categoria.get(); }
    public double getPrecioVenta() { return precioVenta.get(); }
    public int getStockDisponible() { return stockDisponible.get(); }
    public int getStockMinimo() { return stockMinimo.get(); }
    public String getUbicacionAlmacen() { return ubicacionAlmacen.get(); }
    public String getCompatibleMarcas() { return compatibleMarcas.get(); }
    public String getImagen() { return imagen.get(); }
    public String getDescripcion() { return descripcion.get(); }

    // Setters
    public void setIdPieza(int value) { idPieza.set(value); }
    public void setCodigoPieza(String value) { codigoPieza.set(value); }
    public void setNombre(String value) { nombre.set(value); }
    public void setCategoria(String value) { categoria.set(value); }
    public void setPrecioVenta(double value) { precioVenta.set(value); }
    public void setStockDisponible(int value) { stockDisponible.set(value); }
    public void setStockMinimo(int value) { stockMinimo.set(value); }
    public void setUbicacionAlmacen(String value) { ubicacionAlmacen.set(value); }
    public void setCompatibleMarcas(String value) { compatibleMarcas.set(value); }
    public void setImagen(String value) { imagen.set(value); }
    public void setDescripcion(String value) { descripcion.set(value); }

    @Override
    public String toString() {
        return nombre.get() + " (" + codigoPieza.get() + ") - " + categoria.get();
    }
}
