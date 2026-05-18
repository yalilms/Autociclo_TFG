package com.autociclo.services;

import com.autociclo.dto.AprobarSolicitudRequest;
import com.autociclo.dto.ContarofertaRequest;
import com.autociclo.dto.SolicitudRequest;
import com.autociclo.messaging.RabbitMQPublisher;
import com.autociclo.models.*;
import com.autociclo.repositories.*;
import com.autociclo.utils.OdooClient;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SolicitudService {

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    private final SolicitudPresupuestoRepository solicitudRepository;
    private final DetalleSolicitudRepository detalleRepository;
    private final NegociacionHistorialRepository historialRepository;
    private final ClienteRepository clienteRepository;
    private final PiezaRepository piezaRepository;
    private final UsuarioRepository usuarioRepository;
    private final NotificacionService notificacionService;
    private final RabbitMQPublisher rabbitMQPublisher;
    private final OdooClient odooClient;

    @Transactional(readOnly = true)
    public List<SolicitudPresupuesto> findAll() {
        List<SolicitudPresupuesto> lista = solicitudRepository.findAll();
        lista.forEach(s -> {
            s.getCliente().getUsuario();
            s.getDetalles().forEach(d -> d.getPieza().getNombre());
            s.getHistorial().size();
        });
        return lista;
    }

    @Transactional(readOnly = true)
    public List<SolicitudPresupuesto> findByClienteEmail(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        Cliente cliente = clienteRepository.findByUsuario(usuario)
                .orElseThrow(() -> new IllegalArgumentException("Perfil de cliente no encontrado para: " + email));
        List<SolicitudPresupuesto> lista = solicitudRepository.findByClienteIdCliente(cliente.getIdCliente());
        lista.forEach(s -> {
            s.getDetalles().forEach(d -> d.getPieza().getNombre());
            s.getHistorial().size();
        });
        return lista;
    }

    @Transactional(readOnly = true)
    public SolicitudPresupuesto findById(Integer id) {
        SolicitudPresupuesto s = solicitudRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Solicitud no encontrada: " + id));
        s.getCliente().getUsuario();
        s.getDetalles().forEach(d -> d.getPieza().getNombre());
        s.getHistorial().size();
        return s;
    }

    @Transactional
    public SolicitudPresupuesto create(SolicitudRequest req, String emailCliente) {
        Usuario usuario = usuarioRepository.findByEmail(emailCliente)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        Cliente cliente = clienteRepository.findByUsuario(usuario)
                .orElseThrow(() -> new IllegalArgumentException("No tienes perfil de cliente"));

        SolicitudPresupuesto solicitud = new SolicitudPresupuesto();
        solicitud.setCliente(cliente);
        solicitud.setFechaSolicitud(LocalDateTime.now());
        solicitud.setEstado("pendiente");
        solicitud.setPrecioOfertaCliente(req.getPrecioOfertaCliente());
        solicitud.setTurno("admin");
        SolicitudPresupuesto saved = solicitudRepository.save(solicitud);

        req.getDetalles().forEach(d -> {
            Pieza pieza = piezaRepository.findById(d.getIdPieza())
                    .orElseThrow(() -> new IllegalArgumentException("Pieza no encontrada: " + d.getIdPieza()));
            DetalleSolicitudId detalleId = new DetalleSolicitudId(saved.getIdSolicitud(), pieza.getIdPieza());
            DetalleSolicitud detalle = new DetalleSolicitud();
            detalle.setId(detalleId);
            detalle.setSolicitud(saved);
            detalle.setPieza(pieza);
            detalle.setCantidad(d.getCantidad() != null ? d.getCantidad() : 1);
            detalle.setNotas(d.getNotas());
            detalleRepository.save(detalle);
        });

        // Primera entrada en el historial de negociación
        guardarHistorial(saved, 1, "cliente", req.getPrecioOfertaCliente(),
                req.getNotas() != null ? req.getNotas() : "Oferta inicial del cliente.");

        rabbitMQPublisher.publicarNuevaSolicitud(saved.getIdSolicitud(), usuario.getNombre(), emailCliente);

        usuarioRepository.findAll().stream()
                .filter(u -> "ADMIN".equals(u.getRol().getNombre()))
                .forEach(admin -> notificacionService.crearNotificacion(
                        admin.getIdUsuario(),
                        "solicitud_nueva",
                        "Nueva solicitud #" + saved.getIdSolicitud() + " de " + usuario.getNombre()
                                + " — oferta: " + req.getPrecioOfertaCliente() + "€"
                ));

        return solicitudRepository.findById(saved.getIdSolicitud()).orElse(saved);
    }

    // Admin acepta el precio ofertado por el cliente (sin cambiar el precio)
    @Transactional
    public SolicitudPresupuesto aprobar(Integer id, AprobarSolicitudRequest req) {
        SolicitudPresupuesto solicitud = findById(id);
        solicitud.setEstado("aprobada");
        solicitud.setRespuestaAdmin(req.getRespuestaAdmin());
        solicitud.setPrecioTotal(req.getPrecioTotal());
        solicitud.setTurno("admin");
        SolicitudPresupuesto saved = solicitudRepository.save(solicitud);

        notificacionService.crearNotificacion(
                solicitud.getCliente().getUsuario().getIdUsuario(),
                "solicitud_actualizada",
                "Tu solicitud #" + id + " ha sido aprobada. Precio final: " + req.getPrecioTotal() + "€"
        );

        return saved;
    }

    @Transactional
    public SolicitudPresupuesto rechazar(Integer id, String respuesta) {
        SolicitudPresupuesto solicitud = findById(id);
        solicitud.setEstado("rechazada");
        solicitud.setRespuestaAdmin(respuesta);
        solicitud.setTurno("admin");
        SolicitudPresupuesto saved = solicitudRepository.save(solicitud);

        notificacionService.crearNotificacion(
                solicitud.getCliente().getUsuario().getIdUsuario(),
                "solicitud_actualizada",
                "Tu solicitud #" + id + " ha sido rechazada."
        );

        return saved;
    }

    // Admin hace una contraoferta al cliente
    @Transactional
    public SolicitudPresupuesto contraoferta(Integer id, ContarofertaRequest req) {
        SolicitudPresupuesto solicitud = findById(id);

        if ("aprobada".equals(solicitud.getEstado()) || "rechazada".equals(solicitud.getEstado())) {
            throw new IllegalStateException("No se puede contraofertar una solicitud " + solicitud.getEstado());
        }

        int rondaActual = historialRepository.findBySolicitudIdSolicitudOrderByRondaAsc(id).size() + 1;

        solicitud.setEstado("en_negociacion");
        solicitud.setPrecioContraoferta(req.getPrecio());
        solicitud.setRespuestaAdmin(req.getMensaje());
        solicitud.setTurno("cliente");
        solicitudRepository.save(solicitud);

        guardarHistorial(solicitud, rondaActual, "admin", req.getPrecio(), req.getMensaje());

        notificacionService.crearNotificacion(
                solicitud.getCliente().getUsuario().getIdUsuario(),
                "negociacion_nueva",
                "AutoCiclo propone un nuevo precio de " + req.getPrecio()
                        + "€ para tu solicitud #" + id + ". ¡Revísalo!"
        );

        rabbitMQPublisher.publicarContaoferta(id, solicitud.getCliente().getUsuario().getNombre(), req.getPrecio());

        return findById(id);
    }

    // Cliente acepta la contraoferta del admin
    @Transactional
    public SolicitudPresupuesto aceptarOferta(Integer id, String emailCliente) {
        SolicitudPresupuesto solicitud = findById(id);

        if (!"en_negociacion".equals(solicitud.getEstado())) {
            throw new IllegalStateException("La solicitud no está en negociación");
        }
        if (!"cliente".equals(solicitud.getTurno())) {
            throw new IllegalStateException("No es el turno del cliente");
        }

        solicitud.setEstado("aprobada");
        solicitud.setPrecioTotal(solicitud.getPrecioContraoferta());
        solicitud.setTurno("admin");
        SolicitudPresupuesto saved = solicitudRepository.save(solicitud);

        notificacionService.crearNotificacion(
                solicitud.getCliente().getUsuario().getIdUsuario(),
                "solicitud_actualizada",
                "Has aceptado el precio de " + solicitud.getPrecioContraoferta()
                        + "€. Tu solicitud #" + id + " está aprobada."
        );

        usuarioRepository.findAll().stream()
                .filter(u -> "ADMIN".equals(u.getRol().getNombre()))
                .forEach(admin -> notificacionService.crearNotificacion(
                        admin.getIdUsuario(),
                        "solicitud_actualizada",
                        "El cliente ha aceptado el precio de " + solicitud.getPrecioContraoferta()
                                + "€ en la solicitud #" + id
                ));

        return findById(id);
    }

    // Cliente rechaza la contraoferta del admin
    @Transactional
    public SolicitudPresupuesto rechazarOferta(Integer id, String emailCliente) {
        SolicitudPresupuesto solicitud = findById(id);

        if (!"en_negociacion".equals(solicitud.getEstado())) {
            throw new IllegalStateException("La solicitud no está en negociación");
        }
        if (!"cliente".equals(solicitud.getTurno())) {
            throw new IllegalStateException("No es el turno del cliente");
        }

        solicitud.setEstado("rechazada");
        solicitud.setTurno("admin");
        SolicitudPresupuesto saved = solicitudRepository.save(solicitud);

        usuarioRepository.findAll().stream()
                .filter(u -> "ADMIN".equals(u.getRol().getNombre()))
                .forEach(admin -> notificacionService.crearNotificacion(
                        admin.getIdUsuario(),
                        "solicitud_actualizada",
                        "El cliente ha rechazado la contraoferta en la solicitud #" + id
                ));

        return saved;
    }

    // Cliente hace una nueva oferta tras la contraoferta del admin
    @Transactional
    public SolicitudPresupuesto nuevaOfertaCliente(Integer id, ContarofertaRequest req, String emailCliente) {
        SolicitudPresupuesto solicitud = findById(id);

        if (!"en_negociacion".equals(solicitud.getEstado())) {
            throw new IllegalStateException("La solicitud no está en negociación");
        }
        if (!"cliente".equals(solicitud.getTurno())) {
            throw new IllegalStateException("No es el turno del cliente");
        }

        int rondaActual = historialRepository.findBySolicitudIdSolicitudOrderByRondaAsc(id).size() + 1;

        solicitud.setPrecioOfertaCliente(req.getPrecio());
        solicitud.setTurno("admin");
        solicitudRepository.save(solicitud);

        guardarHistorial(solicitud, rondaActual, "cliente", req.getPrecio(), req.getMensaje());

        rabbitMQPublisher.publicarNuevaSolicitud(solicitud.getIdSolicitud(),
                solicitud.getCliente().getUsuario().getNombre(),
                solicitud.getCliente().getUsuario().getEmail());

        usuarioRepository.findAll().stream()
                .filter(u -> "ADMIN".equals(u.getRol().getNombre()))
                .forEach(admin -> notificacionService.crearNotificacion(
                        admin.getIdUsuario(),
                        "negociacion_nueva",
                        "Nueva oferta del cliente: " + req.getPrecio()
                                + "€ en solicitud #" + id
                ));

        return findById(id);
    }

    @Transactional
    public SolicitudPresupuesto marcarPagada(Integer id, String emailCliente, String paymentIntentId) {
        if (paymentIntentId == null || paymentIntentId.isBlank()) {
            throw new IllegalStateException("paymentIntentId requerido");
        }
        try {
            Stripe.apiKey = stripeSecretKey;
            PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);
            if (!"succeeded".equals(intent.getStatus())) {
                throw new IllegalStateException("El pago no está confirmado en Stripe (estado: " + intent.getStatus() + ")");
            }
        } catch (StripeException e) {
            throw new IllegalStateException("No se pudo verificar el pago con Stripe: " + e.getMessage());
        }
        SolicitudPresupuesto solicitud = findById(id);
        if (!"aprobada".equals(solicitud.getEstado())) {
            throw new IllegalStateException("Solo se puede pagar una solicitud aprobada");
        }
        solicitud.setEstado("pagada");
        SolicitudPresupuesto saved = solicitudRepository.save(solicitud);

        notificacionService.crearNotificacion(
                solicitud.getCliente().getUsuario().getIdUsuario(),
                "solicitud_actualizada",
                "Pago completado para la solicitud #" + id + ". ¡Gracias por tu compra!"
        );
        usuarioRepository.findAll().stream()
                .filter(u -> "ADMIN".equals(u.getRol().getNombre()))
                .forEach(admin -> notificacionService.crearNotificacion(
                        admin.getIdUsuario(),
                        "solicitud_actualizada",
                        "Pago recibido para la solicitud #" + id
                                + " — " + solicitud.getPrecioTotal() + "€"
                ));

        enviarAOdoo(saved);
        return saved;
    }

    @Transactional
    public SolicitudPresupuesto marcarEnviada(Integer id) {
        SolicitudPresupuesto solicitud = findById(id);
        if (!"pagada".equals(solicitud.getEstado())) {
            throw new IllegalStateException("Solo se puede marcar como enviada una solicitud pagada");
        }
        solicitud.setEstado("enviado");
        SolicitudPresupuesto saved = solicitudRepository.save(solicitud);
        notificacionService.crearNotificacion(
                solicitud.getCliente().getUsuario().getIdUsuario(),
                "solicitud_actualizada",
                "Tu pedido #" + id + " ha sido enviado. ¡Pronto lo recibirás!"
        );
        return saved;
    }

    public List<NegociacionHistorial> findHistorial(Integer idSolicitud) {
        return historialRepository.findBySolicitudIdSolicitudOrderByRondaAsc(idSolicitud);
    }

    /**
     * Crea el pedido de venta en Odoo con el precio negociado (IVA incluido).
     * Los precios se distribuyen proporcionalmente al catálogo y se dividen
     * entre 1,21 para que Odoo añada el IVA por encima y cuadre el total.
     */
    private void enviarAOdoo(SolicitudPresupuesto solicitud) {
        try {
            if (solicitud.getPrecioTotal() == null) return;

            double totalConIva   = solicitud.getPrecioTotal().doubleValue();
            double baseImponible = totalConIva / 1.21;

            double totalCatalogo = solicitud.getDetalles().stream()
                    .mapToDouble(d -> d.getPieza().getPrecioVenta().doubleValue() * d.getCantidad())
                    .sum();
            double factor = totalCatalogo > 0 ? baseImponible / totalCatalogo : 1.0;

            List<Map<String, Object>> lineas = solicitud.getDetalles().stream()
                    .map(d -> {
                        double precioBase = d.getPieza().getPrecioVenta().doubleValue() * factor;
                        double redondeado = BigDecimal.valueOf(precioBase)
                                .setScale(2, RoundingMode.HALF_UP).doubleValue();
                        return Map.<String, Object>of(
                                "nombre",         d.getPieza().getNombre(),
                                "cantidad",       d.getCantidad(),
                                "precioUnitario", redondeado
                        );
                    }).toList();

            String nombreCliente = solicitud.getCliente().getUsuario().getNombre();
            String emailCliente  = solicitud.getCliente().getUsuario().getEmail();
            String refOdoo = odooClient.crearPedidoVenta(nombreCliente, emailCliente, lineas);

            if (refOdoo != null) {
                solicitud.setReferenciaOdoo(refOdoo);
                solicitudRepository.save(solicitud);
                notificacionService.crearNotificacion(
                        solicitud.getCliente().getUsuario().getIdUsuario(),
                        "odoo_pedido",
                        "Pedido de venta creado en Odoo: " + refOdoo
                );
            }
        } catch (Exception e) {
            System.err.println("[SolicitudService] Odoo no disponible: " + e.getMessage());
        }
    }

    private void guardarHistorial(SolicitudPresupuesto solicitud, int ronda,
                                   String autor, java.math.BigDecimal precio, String mensaje) {
        NegociacionHistorial entrada = new NegociacionHistorial();
        entrada.setSolicitud(solicitud);
        entrada.setRonda(ronda);
        entrada.setAutor(autor);
        entrada.setPrecio(precio);
        entrada.setMensaje(mensaje);
        entrada.setFecha(LocalDateTime.now());
        historialRepository.save(entrada);
    }
}
