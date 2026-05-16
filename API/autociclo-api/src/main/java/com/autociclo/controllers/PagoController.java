package com.autociclo.controllers;

import com.autociclo.models.SolicitudPresupuesto;
import com.autociclo.repositories.SolicitudPresupuestoRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/pagos")
@RequiredArgsConstructor
public class PagoController {

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    private final SolicitudPresupuestoRepository solicitudRepository;

    @PostMapping("/intento")
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<?> crearIntento(
            @RequestBody Map<String, Integer> body,
            @AuthenticationPrincipal UserDetails userDetails) {

        Integer solicitudId = body.get("solicitudId");
        if (solicitudId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "solicitudId requerido"));
        }

        SolicitudPresupuesto sol = solicitudRepository.findById(solicitudId).orElse(null);
        if (sol == null) {
            return ResponseEntity.notFound().build();
        }
        if (!"aprobada".equals(sol.getEstado())) {
            return ResponseEntity.badRequest().body(Map.of("error", "La solicitud no está aprobada"));
        }
        if (sol.getPrecioTotal() == null || sol.getPrecioTotal().compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Precio no válido"));
        }

        try {
            Stripe.apiKey = stripeSecretKey;
            long centimos = sol.getPrecioTotal().multiply(BigDecimal.valueOf(100)).longValue();

            PaymentIntent intent = PaymentIntent.create(
                PaymentIntentCreateParams.builder()
                    .setAmount(centimos)
                    .setCurrency("eur")
                    .setDescription("AutoCiclo — Solicitud #" + solicitudId)
                    .putMetadata("solicitudId", String.valueOf(solicitudId))
                    .putMetadata("clienteEmail", userDetails.getUsername())
                    .addPaymentMethodType("card")
                    .build()
            );

            return ResponseEntity.ok(Map.of(
                "clientSecret", intent.getClientSecret(),
                "importeTotal",  sol.getPrecioTotal(),
                "solicitudId",   solicitudId
            ));

        } catch (StripeException e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Error Stripe: " + e.getMessage()));
        }
    }
}
