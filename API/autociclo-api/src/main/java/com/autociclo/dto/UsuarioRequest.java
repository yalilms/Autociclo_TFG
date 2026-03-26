package com.autociclo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UsuarioRequest {
    @NotBlank private String nombre;
    @Email @NotBlank private String email;
    private String password;
    @NotBlank private String rolNombre;
    private Boolean activo = true;
}
