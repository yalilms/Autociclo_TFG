package com.autociclo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class InventarioRequest {
    @NotNull  private Integer idVehiculo;
    @NotNull  private Integer idPieza;
    @NotNull  private Integer cantidad;
    @NotBlank private String estadoPieza;
    @NotNull  private LocalDate fechaExtraccion;
    @NotNull  private BigDecimal precioUnitario;
    private String notas;
}
