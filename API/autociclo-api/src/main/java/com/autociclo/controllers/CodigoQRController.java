package com.autociclo.controllers;

import com.autociclo.models.CodigoQR;
import com.autociclo.services.CodigoQRService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/codigos-qr")
@RequiredArgsConstructor
public class CodigoQRController {

    private final CodigoQRService codigoQRService;

    @GetMapping
    public List<CodigoQR> getAll() {
        return codigoQRService.findAll();
    }

    @GetMapping("/{codigo}")
    public CodigoQR getByCodigo(@PathVariable String codigo) {
        return codigoQRService.findByCodigo(codigo);
    }

    @GetMapping("/buscar")
    public List<CodigoQR> buscar(@RequestParam String tipo, @RequestParam Integer id) {
        return codigoQRService.findByTipoYReferencia(tipo, id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','EMPLEADO')")
    public ResponseEntity<CodigoQR> generate(@RequestBody Map<String, Object> body) {
        String tipo = (String) body.get("tipo");
        Integer idReferencia = (Integer) body.get("idReferencia");
        return ResponseEntity.status(HttpStatus.CREATED).body(codigoQRService.generate(tipo, idReferencia));
    }
}
