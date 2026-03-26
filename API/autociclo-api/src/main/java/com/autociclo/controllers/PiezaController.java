package com.autociclo.controllers;

import com.autociclo.dto.PiezaRequest;
import com.autociclo.models.Pieza;
import com.autociclo.services.PiezaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/piezas")
@RequiredArgsConstructor
public class PiezaController {

    private final PiezaService piezaService;

    @GetMapping
    public List<Pieza> getAll() {
        return piezaService.findAll();
    }

    @GetMapping("/buscar")
    public List<Pieza> buscar(@RequestParam(required = false) String q,
                               @RequestParam(required = false) String categoria,
                               @RequestParam(required = false) String marca) {
        return piezaService.buscar(q, categoria, marca);
    }

    @GetMapping("/{id}")
    public Pieza getById(@PathVariable Integer id) {
        return piezaService.findById(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Pieza> create(@Valid @RequestBody PiezaRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(piezaService.create(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Pieza update(@PathVariable Integer id, @Valid @RequestBody PiezaRequest req) {
        return piezaService.update(id, req);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        piezaService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
