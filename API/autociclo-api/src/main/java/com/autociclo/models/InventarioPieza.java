package com.autociclo.models;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "INVENTARIO_PIEZAS")
public class InventarioPieza {

    @EmbeddedId
    private InventarioPiezaId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idVehiculo")
    @JoinColumn(name = "id_vehiculo")
    private Vehiculo vehiculo;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idPieza")
    @JoinColumn(name = "id_pieza")
    private Pieza pieza;

    @Column(nullable = false)
    private Integer cantidad;

    // 'nueva','usada','reparada'
    @Column(name = "estado_pieza", nullable = false, length = 10)
    private String estadoPieza;

    @Column(name = "fecha_extraccion", nullable = false)
    private LocalDate fechaExtraccion;

    @Column(name = "precio_unitario", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioUnitario;

    @Column(length = 255)
    private String notas;
}
