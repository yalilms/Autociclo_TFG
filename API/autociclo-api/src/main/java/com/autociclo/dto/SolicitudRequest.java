package com.autociclo.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class SolicitudRequest {
    @NotEmpty
    private List<DetalleSolicitudRequest> detalles;
}
