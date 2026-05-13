package com.autociclo.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class SolicitudRequest {
    @NotEmpty
    private List<DetalleSolicitudRequest> detalles;

    @NotNull
    private BigDecimal precioOfertaCliente;

    private String notas;
}
