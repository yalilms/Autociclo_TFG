package com.autociclo.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ContarofertaRequest {
    @NotNull
    private BigDecimal precio;
    private String mensaje;
}
