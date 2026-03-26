package com.autociclo.models;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class DetalleSolicitudId implements Serializable {

    @Column(name = "id_solicitud")
    private Integer idSolicitud;

    @Column(name = "id_pieza")
    private Integer idPieza;
}
