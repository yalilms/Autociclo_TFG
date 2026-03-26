package com.autociclo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class VehiculoRequest {
    @NotBlank private String matricula;
    @NotBlank private String marca;
    @NotBlank private String modelo;
    @NotNull  private Integer anio;
    private String color;
    @NotNull  private LocalDate fechaEntrada;
    @NotBlank private String estado;
    @NotNull  private BigDecimal precioCompra;
    private Integer kilometraje;
    private String ubicacionGps;
    private String observaciones;
}
