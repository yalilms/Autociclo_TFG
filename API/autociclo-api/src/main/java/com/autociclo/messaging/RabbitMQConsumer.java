package com.autociclo.messaging;

import com.autociclo.config.RabbitMQConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
public class RabbitMQConsumer {

    @RabbitListener(queues = RabbitMQConfig.QUEUE_SOLICITUDES)
    public void recibirSolicitud(Map<String, Object> mensaje) {
        log.info("[Consumer] Nueva solicitud recibida — idSolicitud={} cliente={} email={}",
                mensaje.get("idSolicitud"),
                mensaje.get("cliente"),
                mensaje.get("email"));
    }

    @RabbitListener(queues = RabbitMQConfig.QUEUE_STOCK)
    public void recibirAlertaStock(Map<String, Object> mensaje) {
        log.warn("[Consumer] ALERTA STOCK — pieza={} ({}) stock={} mínimo={}",
                mensaje.get("nombre"),
                mensaje.get("codigo"),
                mensaje.get("stockActual"),
                mensaje.get("stockMinimo"));
    }
}
