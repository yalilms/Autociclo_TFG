package com.autociclo.controllers;

import com.autociclo.dto.AprobarSolicitudRequest;
import com.autociclo.dto.SolicitudRequest;
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
        if (esAdmin) {
            return solicitudService.findAll();
        }
        return solicitudService.findByClienteEmail(userDetails.getUsername());
    }

    @GetMapping("/{id}")
    public SolicitudPresupuesto getById(@PathVariable Integer id) {
        return solicitudService.findById(id);
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
}
