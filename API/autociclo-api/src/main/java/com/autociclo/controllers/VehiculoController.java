package com.autociclo.controllers;

import com.autociclo.dto.VehiculoRequest;
import com.autociclo.models.Vehiculo;
import com.autociclo.services.VehiculoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehiculos")
@RequiredArgsConstructor
public class VehiculoController {

    private final VehiculoService vehiculoService;

    @GetMapping
    public List<Vehiculo> getAll() {
        return vehiculoService.findAll();
    }

    @GetMapping("/{id}")
    public Vehiculo getById(@PathVariable Integer id) {
        return vehiculoService.findById(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Vehiculo> create(@Valid @RequestBody VehiculoRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(vehiculoService.create(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Vehiculo update(@PathVariable Integer id, @Valid @RequestBody VehiculoRequest req) {
        return vehiculoService.update(id, req);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        vehiculoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
