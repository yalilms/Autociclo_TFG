package com.autociclo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MovimientoStockRequest {
    @NotNull  private Integer idPieza;
    @NotBlank private String tipo; // 'entrada' o 'salida'
    @NotNull  private Integer cantidad;
    private String notas;
}
