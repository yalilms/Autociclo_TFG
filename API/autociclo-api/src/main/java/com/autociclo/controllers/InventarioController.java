package com.autociclo.controllers;

import com.autociclo.dto.InventarioRequest;
import com.autociclo.models.InventarioPieza;
import com.autociclo.services.InventarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventario")
@RequiredArgsConstructor
public class InventarioController {

    private final InventarioService inventarioService;

    @GetMapping
    public List<InventarioPieza> getAll() {
        return inventarioService.findAll();
    }

    @GetMapping("/vehiculo/{idVehiculo}")
    public List<InventarioPieza> getByVehiculo(@PathVariable Integer idVehiculo) {
        return inventarioService.findByVehiculo(idVehiculo);
    }

    @GetMapping("/pieza/{idPieza}")
    public List<InventarioPieza> getByPieza(@PathVariable Integer idPieza) {
        return inventarioService.findByPieza(idPieza);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InventarioPieza> create(@Valid @RequestBody InventarioRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inventarioService.create(req));
    }

    @PutMapping("/{idVehiculo}/{idPieza}")
    @PreAuthorize("hasAnyRole('ADMIN','EMPLEADO')")
    public InventarioPieza update(@PathVariable Integer idVehiculo,
                                   @PathVariable Integer idPieza,
                                   @Valid @RequestBody InventarioRequest req) {
        return inventarioService.update(idVehiculo, idPieza, req);
    }

    @DeleteMapping("/{idVehiculo}/{idPieza}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Integer idVehiculo,
                                        @PathVariable Integer idPieza) {
        inventarioService.delete(idVehiculo, idPieza);
        return ResponseEntity.noContent().build();
    }
}
