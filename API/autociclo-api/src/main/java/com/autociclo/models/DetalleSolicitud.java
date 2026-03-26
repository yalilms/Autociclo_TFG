package com.autociclo.models;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "DETALLE_SOLICITUD")
public class DetalleSolicitud {

    @EmbeddedId
    private DetalleSolicitudId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idSolicitud")
    @JoinColumn(name = "id_solicitud")
    private SolicitudPresupuesto solicitud;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idPieza")
    @JoinColumn(name = "id_pieza")
    private Pieza pieza;

    @Column(nullable = false)
    private Integer cantidad = 1;

    @Column(length = 255)
    private String notas;
}
