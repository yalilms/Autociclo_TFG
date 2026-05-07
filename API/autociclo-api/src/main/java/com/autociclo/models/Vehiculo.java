package com.autociclo.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "VEHICULOS")
public class Vehiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_vehiculo")
    private Integer idVehiculo;

    @Column(nullable = false, unique = true, length = 10)
    private String matricula;

    @Column(nullable = false, length = 50)
    private String marca;

    @Column(nullable = false, length = 50)
    private String modelo;

    @Column(nullable = false)
    private Integer anio;

    @Column(length = 30)
    private String color;

    @Column(name = "fecha_entrada", nullable = false)
    private LocalDate fechaEntrada;

    // 'completo','desguazando','desguazado'
    @Column(nullable = false, columnDefinition = "enum('completo','desguazando','desguazado')")
    private String estado;

    @Column(name = "precio_compra", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioCompra;

    private Integer kilometraje;

    @Column(name = "ubicacion_gps", length = 50)
    private String ubicacionGps;

    @Column(columnDefinition = "TEXT")
    private String observaciones;
}
