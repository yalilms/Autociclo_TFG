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
        Map<String, Object> mensaje = Map.of(
                "evento",       "NUEVA_SOLICITUD",
                "idSolicitud",  idSolicitud,
                "cliente",      nombreCliente,
                "email",        emailCliente
        );
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.RK_SOLICITUDES, mensaje);
        log.info("[RabbitMQ] Publicado en {}: solicitud #{} de {}", RabbitMQConfig.QUEUE_SOLICITUDES, idSolicitud, nombreCliente);
    }

    public void publicarAlertaStock(Integer idPieza, String codigoPieza, String nombrePieza,
                                    int stockActual, int stockMinimo) {
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
    }
}
