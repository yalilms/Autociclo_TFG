package com.autociclo.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DetalleSolicitudRequest {
    @NotNull private Integer idPieza;
    private Integer cantidad = 1;
    private String notas;
}
