package com.autociclo.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "NEGOCIACION_HISTORIAL")
public class NegociacionHistorial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_solicitud", nullable = false)
    @JsonIgnore
    private SolicitudPresupuesto solicitud;

    @Column(nullable = false)
    private Integer ronda;

    // 'cliente' | 'admin'
    @Column(nullable = false, columnDefinition = "enum('cliente','admin')")
    private String autor;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;

    @Column(columnDefinition = "TEXT")
    private String mensaje;

    @Column(nullable = false)
    private LocalDateTime fecha;
}
