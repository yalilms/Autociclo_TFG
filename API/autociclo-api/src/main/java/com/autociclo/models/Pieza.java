package com.autociclo.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Table(name = "PIEZAS")
public class Pieza {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pieza")
    private Integer idPieza;

    @Column(name = "codigo_pieza", nullable = false, unique = true, length = 20)
    private String codigoPieza;

    @Column(nullable = false, length = 100)
    private String nombre;

    // 'motor','carroceria','interior','electronica','ruedas','otros'
    @Column(nullable = false, columnDefinition = "enum('motor','carroceria','interior','electronica','ruedas','otros')")
    private String categoria;

    @Column(name = "precio_venta", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioVenta;

    @Column(name = "stock_disponible", nullable = false)
    private Integer stockDisponible = 0;

    @Column(name = "stock_minimo", nullable = false)
    private Integer stockMinimo = 1;

    @Column(name = "ubicacion_almacen", length = 50)
    private String ubicacionAlmacen;

    @Column(name = "compatible_marcas", columnDefinition = "TEXT")
    private String compatibleMarcas;

    @Column(columnDefinition = "LONGTEXT")
    private String imagen;

    @Column(columnDefinition = "TEXT")
    private String descripcion;
}
