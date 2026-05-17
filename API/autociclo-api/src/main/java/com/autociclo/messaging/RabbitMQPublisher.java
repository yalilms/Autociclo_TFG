package com.autociclo.messaging;

import com.autociclo.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class RabbitMQPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publicarNuevaSolicitud(Integer idSolicitud, String nombreCliente, String emailCliente) {
        try {
            Map<String, Object> mensaje = Map.of(
                    "evento",       "NUEVA_SOLICITUD",
                    "idSolicitud",  idSolicitud,
                    "cliente",      nombreCliente,
                    "email",        emailCliente
            );
            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.RK_SOLICITUDES, mensaje);
            log.info("[RabbitMQ] Publicado en {}: solicitud #{} de {}", RabbitMQConfig.QUEUE_SOLICITUDES, idSolicitud, nombreCliente);
        } catch (Exception e) {
            log.warn("[RabbitMQ] No disponible — solicitud #{} no notificada: {}", idSolicitud, e.getMessage());
        }
    }

    public void publicarContaoferta(Integer idSolicitud, String nombreCliente, java.math.BigDecimal precio) {
        try {
            Map<String, Object> mensaje = Map.of(
                    "evento",      "OFERTA_CLIENTE",
                    "idSolicitud", idSolicitud,
                    "cliente",     nombreCliente,
                    "precio",      precio
            );
            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.RK_SOLICITUDES, mensaje);
            log.info("[RabbitMQ] Oferta cliente en {}: solicitud #{} — {}€", RabbitMQConfig.QUEUE_SOLICITUDES, idSolicitud, precio);
        } catch (Exception e) {
            log.warn("[RabbitMQ] No disponible — contraoferta solicitud #{} no notificada: {}", idSolicitud, e.getMessage());
        }
    }

    public void publicarAlertaStock(Integer idPieza, String codigoPieza, String nombrePieza,
                                    int stockActual, int stockMinimo) {
        try {
            Map<String, Object> mensaje = Map.of(
                    "evento",       "STOCK_BAJO",
                    "idPieza",      idPieza,
                    "codigo",       codigoPieza,
                    "nombre",       nombrePieza,
                    "stockActual",  stockActual,
                    "stockMinimo",  stockMinimo
            );
            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.RK_STOCK, mensaje);
            log.warn("[RabbitMQ] ALERTA STOCK en {}: {} ({}) stock={} < mínimo={}",
                    RabbitMQConfig.QUEUE_STOCK, nombrePieza, codigoPieza, stockActual, stockMinimo);
        } catch (Exception e) {
            log.warn("[RabbitMQ] No disponible — alerta stock pieza {} no enviada: {}", codigoPieza, e.getMessage());
        }
    }
}
