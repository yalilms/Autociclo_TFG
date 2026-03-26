package com.autociclo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PiezaRequest {
    @NotBlank private String codigoPieza;
    @NotBlank private String nombre;
    @NotBlank private String categoria;
    @NotNull  private BigDecimal precioVenta;
    private Integer stockDisponible = 0;
    private Integer stockMinimo = 1;
    private String ubicacionAlmacen;
    private String compatibleMarcas;
    private String imagen;
    private String descripcion;
}
