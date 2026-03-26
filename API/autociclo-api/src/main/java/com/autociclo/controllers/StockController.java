package com.autociclo.controllers;

import com.autociclo.dto.MovimientoStockRequest;
import com.autociclo.models.MovimientoStock;
import com.autociclo.models.Pieza;
import com.autociclo.services.StockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;

    @GetMapping("/alertas")
    @PreAuthorize("hasAnyRole('ADMIN','EMPLEADO')")
    public List<Pieza> getAlertas() {
        return stockService.getAlertas();
    }

    @GetMapping("/movimientos/{idPieza}")
    @PreAuthorize("hasAnyRole('ADMIN','EMPLEADO')")
    public List<MovimientoStock> getMovimientos(@PathVariable Integer idPieza) {
        return stockService.getMovimientos(idPieza);
    }

    @PostMapping("/movimiento")
    @PreAuthorize("hasAnyRole('ADMIN','EMPLEADO')")
    public ResponseEntity<MovimientoStock> registrar(
            @Valid @RequestBody MovimientoStockRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(stockService.registrarMovimiento(req, userDetails.getUsername()));
    }
}
