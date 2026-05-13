package com.autociclo.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "SOLICITUDES_PRESUPUESTO")
public class SolicitudPresupuesto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_solicitud")
    private Integer idSolicitud;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_cliente", nullable = false)
    private Cliente cliente;

    @Column(name = "fecha_solicitud", nullable = false)
    private LocalDateTime fechaSolicitud;

    // 'pendiente','en_negociacion','aprobada','rechazada'
    @Column(nullable = false, columnDefinition = "enum('pendiente','en_negociacion','aprobada','rechazada')")
    private String estado = "pendiente";

    @Column(name = "respuesta_admin", columnDefinition = "TEXT")
    private String respuestaAdmin;

    @Column(name = "precio_total", precision = 10, scale = 2)
    private BigDecimal precioTotal;

    @Column(name = "precio_oferta_cliente", precision = 10, scale = 2)
    private BigDecimal precioOfertaCliente;

    @Column(name = "precio_contraoferta", precision = 10, scale = 2)
    private BigDecimal precioContraoferta;

    // 'cliente' | 'admin' — de quién es el turno en la negociación
    @Column(nullable = false, columnDefinition = "enum('cliente','admin')")
    private String turno = "admin";

    @Column(name = "referencia_odoo", length = 50)
    private String referenciaOdoo;

    @OneToMany(mappedBy = "solicitud", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DetalleSolicitud> detalles;

    @OneToMany(mappedBy = "solicitud", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<NegociacionHistorial> historial;
}
