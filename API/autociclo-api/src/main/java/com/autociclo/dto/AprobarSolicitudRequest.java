package com.autociclo.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class AprobarSolicitudRequest {
    private String respuestaAdmin;
    private BigDecimal precioTotal;
}
