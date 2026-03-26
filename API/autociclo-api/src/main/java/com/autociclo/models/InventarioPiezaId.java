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
public class InventarioPiezaId implements Serializable {

    @Column(name = "id_vehiculo")
    private Integer idVehiculo;

    @Column(name = "id_pieza")
    private Integer idPieza;
}
