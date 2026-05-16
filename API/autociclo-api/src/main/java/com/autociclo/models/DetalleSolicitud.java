package com.autociclo.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.ToString;

@Data
@EqualsAndHashCode(exclude = "solicitud")
@ToString(exclude = "solicitud")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "DETALLE_SOLICITUD")
public class DetalleSolicitud {

    @EmbeddedId
    private DetalleSolicitudId id;

    @JsonIgnore
    @Getter(onMethod_ = {@JsonIgnore})
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
