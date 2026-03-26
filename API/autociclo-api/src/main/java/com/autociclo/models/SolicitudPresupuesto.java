package com.autociclo.models;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "SOLICITUDES_PRESUPUESTO")
public class SolicitudPresupuesto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_solicitud")
    private Integer idSolicitud;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cliente", nullable = false)
    private Cliente cliente;

    @Column(name = "fecha_solicitud", nullable = false)
    private LocalDateTime fechaSolicitud;

    // 'pendiente','en_revision','aprobada','rechazada'
    @Column(nullable = false, length = 15)
    private String estado = "pendiente";

    @Column(name = "respuesta_admin", columnDefinition = "TEXT")
    private String respuestaAdmin;

    @Column(name = "precio_total", precision = 10, scale = 2)
    private BigDecimal precioTotal;

    @OneToMany(mappedBy = "solicitud", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DetalleSolicitud> detalles;
}
