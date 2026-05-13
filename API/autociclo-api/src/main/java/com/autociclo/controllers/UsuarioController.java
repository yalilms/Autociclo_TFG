package com.autociclo.controllers;

import com.autociclo.dto.UsuarioRequest;
import com.autociclo.models.Usuario;
import com.autociclo.services.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    public List<Usuario> getAll() {
        return usuarioService.findAll();
    }

    @GetMapping("/{id}")
    public Usuario getById(@PathVariable Integer id) {
        return usuarioService.findById(id);
    }

    @PostMapping
    public ResponseEntity<Usuario> create(@Valid @RequestBody UsuarioRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.create(req));
    }

    @PutMapping("/{id}")
    public Usuario update(@PathVariable Integer id, @Valid @RequestBody UsuarioRequest req) {
        return usuarioService.update(id, req);
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<Void> resetPassword(@PathVariable Integer id,
                                              @RequestBody java.util.Map<String, String> body) {
        String nuevaPassword = body.get("password");
        if (nuevaPassword == null || nuevaPassword.isBlank() || nuevaPassword.length() < 6) {
            throw new IllegalArgumentException("La contraseña debe tener al menos 6 caracteres");
        }
        usuarioService.resetPassword(id, nuevaPassword);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivate(@PathVariable Integer id) {
        usuarioService.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}
