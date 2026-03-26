package com.autociclo.controllers;

import com.autociclo.models.Notificacion;
import com.autociclo.services.NotificacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notificaciones")
@RequiredArgsConstructor
public class NotificacionController {

    private final NotificacionService notificacionService;

    @GetMapping
    public List<Notificacion> getMias(@AuthenticationPrincipal UserDetails userDetails) {
        return notificacionService.findByUsuario(userDetails.getUsername());
    }

    @GetMapping("/no-leidas")
    public List<Notificacion> getNoLeidas(@AuthenticationPrincipal UserDetails userDetails) {
        return notificacionService.findNoLeidasByUsuario(userDetails.getUsername());
    }

    @PutMapping("/{id}/leer")
    public ResponseEntity<Void> marcarLeida(@PathVariable Integer id,
                                             @AuthenticationPrincipal UserDetails userDetails) {
        notificacionService.marcarLeida(id, userDetails.getUsername());
        return ResponseEntity.ok().build();
    }
}
