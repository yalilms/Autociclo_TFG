package com.autociclo.services;

import com.autociclo.dto.AprobarSolicitudRequest;
import com.autociclo.dto.SolicitudRequest;
import com.autociclo.messaging.RabbitMQPublisher;
import com.autociclo.models.*;
import com.autociclo.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SolicitudService {

    private final SolicitudPresupuestoRepository solicitudRepository;
    private final DetalleSolicitudRepository detalleRepository;
    private final ClienteRepository clienteRepository;
    private final PiezaRepository piezaRepository;
    private final UsuarioRepository usuarioRepository;
    private final NotificacionService notificacionService;
    private final RabbitMQPublisher rabbitMQPublisher;

    public List<SolicitudPresupuesto> findAll() {
        return solicitudRepository.findAll();
    }

    public List<SolicitudPresupuesto> findByClienteEmail(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        Cliente cliente = clienteRepository.findByUsuario(usuario)
                .orElseThrow(() -> new IllegalArgumentException("Perfil de cliente no encontrado para: " + email));
        return solicitudRepository.findByClienteIdCliente(cliente.getIdCliente());
    }

    public SolicitudPresupuesto findById(Integer id) {
        return solicitudRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Solicitud no encontrada: " + id));
    }

    @Transactional
    public SolicitudPresupuesto create(SolicitudRequest req, String emailCliente) {
        Usuario usuario = usuarioRepository.findByEmail(emailCliente)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        Cliente cliente = clienteRepository.findByUsuario(usuario)
                .orElseThrow(() -> new IllegalArgumentException("No tienes perfil de cliente"));

        // 1. Guardar la solicitud primero
        SolicitudPresupuesto solicitud = new SolicitudPresupuesto();
        solicitud.setCliente(cliente);
        solicitud.setFechaSolicitud(LocalDateTime.now());
        solicitud.setEstado("pendiente");
        SolicitudPresupuesto saved = solicitudRepository.save(solicitud);

        // 2. Guardar los detalles con el id de solicitud ya conocido
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

        // 3. Publicar en RabbitMQ
        rabbitMQPublisher.publicarNuevaSolicitud(saved.getIdSolicitud(), usuario.getNombre(), emailCliente);

        // 4. Notificar a todos los admins
        usuarioRepository.findAll().stream()
                .filter(u -> "ADMIN".equals(u.getRol().getNombre()))
                .forEach(admin -> notificacionService.crearNotificacion(
                        admin.getIdUsuario(),
                        "solicitud_nueva",
                        "Nueva solicitud de presupuesto #" + saved.getIdSolicitud() + " de " + usuario.getNombre()
                ));

        return solicitudRepository.findById(saved.getIdSolicitud()).orElse(saved);
    }

    @Transactional
    public SolicitudPresupuesto aprobar(Integer id, AprobarSolicitudRequest req) {
        SolicitudPresupuesto solicitud = findById(id);
        solicitud.setEstado("aprobada");
        solicitud.setRespuestaAdmin(req.getRespuestaAdmin());
        solicitud.setPrecioTotal(req.getPrecioTotal());
        SolicitudPresupuesto saved = solicitudRepository.save(solicitud);

        notificacionService.crearNotificacion(
                solicitud.getCliente().getUsuario().getIdUsuario(),
                "solicitud_actualizada",
                "Tu solicitud #" + id + " ha sido aprobada. Precio total: " + req.getPrecioTotal() + "€"
        );

        return saved;
    }

    @Transactional
    public SolicitudPresupuesto rechazar(Integer id, String respuesta) {
        SolicitudPresupuesto solicitud = findById(id);
        solicitud.setEstado("rechazada");
        solicitud.setRespuestaAdmin(respuesta);
        SolicitudPresupuesto saved = solicitudRepository.save(solicitud);

        notificacionService.crearNotificacion(
                solicitud.getCliente().getUsuario().getIdUsuario(),
                "solicitud_actualizada",
                "Tu solicitud #" + id + " ha sido rechazada."
        );

        return saved;
    }
}
