package com.autociclo.controllers;

import com.autociclo.dto.AprobarSolicitudRequest;
import com.autociclo.dto.ContarofertaRequest;
import com.autociclo.dto.SolicitudRequest;
import com.autociclo.models.NegociacionHistorial;
import com.autociclo.models.SolicitudPresupuesto;
import com.autociclo.services.SolicitudService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/solicitudes")
@RequiredArgsConstructor
public class SolicitudController {

    private final SolicitudService solicitudService;

    @GetMapping
    public List<SolicitudPresupuesto> getAll(@AuthenticationPrincipal UserDetails userDetails) {
        boolean esAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (esAdmin) return solicitudService.findAll();
        return solicitudService.findByClienteEmail(userDetails.getUsername());
    }

    @GetMapping("/{id}")
    public SolicitudPresupuesto getById(@PathVariable Integer id) {
        return solicitudService.findById(id);
    }

    @GetMapping("/{id}/historial")
    public List<NegociacionHistorial> getHistorial(@PathVariable Integer id) {
        return solicitudService.findHistorial(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<SolicitudPresupuesto> create(
            @Valid @RequestBody SolicitudRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(solicitudService.create(req, userDetails.getUsername()));
    }

    @PutMapping("/{id}/aprobar")
    @PreAuthorize("hasRole('ADMIN')")
    public SolicitudPresupuesto aprobar(@PathVariable Integer id,
                                        @RequestBody AprobarSolicitudRequest req) {
        return solicitudService.aprobar(id, req);
    }

    @PutMapping("/{id}/rechazar")
    @PreAuthorize("hasRole('ADMIN')")
    public SolicitudPresupuesto rechazar(@PathVariable Integer id,
                                         @RequestBody Map<String, String> body) {
        return solicitudService.rechazar(id, body.get("respuestaAdmin"));
    }

    @PutMapping("/{id}/contraoferta")
    @PreAuthorize("hasRole('ADMIN')")
    public SolicitudPresupuesto contraoferta(@PathVariable Integer id,
                                              @Valid @RequestBody ContarofertaRequest req) {
        return solicitudService.contraoferta(id, req);
    }

    @PutMapping("/{id}/aceptar-oferta")
    @PreAuthorize("hasRole('CLIENTE')")
    public SolicitudPresupuesto aceptarOferta(@PathVariable Integer id,
                                               @AuthenticationPrincipal UserDetails userDetails) {
        return solicitudService.aceptarOferta(id, userDetails.getUsername());
    }

    @PutMapping("/{id}/rechazar-oferta")
    @PreAuthorize("hasRole('CLIENTE')")
    public SolicitudPresupuesto rechazarOferta(@PathVariable Integer id,
                                                @AuthenticationPrincipal UserDetails userDetails) {
        return solicitudService.rechazarOferta(id, userDetails.getUsername());
    }

    @PutMapping("/{id}/nueva-oferta")
    @PreAuthorize("hasRole('CLIENTE')")
    public SolicitudPresupuesto nuevaOferta(@PathVariable Integer id,
                                             @Valid @RequestBody ContarofertaRequest req,
                                             @AuthenticationPrincipal UserDetails userDetails) {
        return solicitudService.nuevaOfertaCliente(id, req, userDetails.getUsername());
    }
}
