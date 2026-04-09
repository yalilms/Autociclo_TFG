package com.autociclo.rabbitmq;

import com.rabbitmq.client.*;
import javafx.application.Platform;

import java.util.function.Consumer;

/**
 * Listener AMQP que se suscribe a la cola "solicitudes.nueva" en segundo plano.
 * Cuando llega un mensaje llama al callback proporcionado en el hilo JavaFX.
 *
 * @author Yalil Musa Talhaoui
 */
public class RabbitMQListener {

    private static final String HOST     = "localhost";
    private static final int    PORT     = 5672;
    private static final String USER     = "guest";
    private static final String PASS     = "guest";
    private static final String EXCHANGE = "autociclo.exchange";
    private static final String QUEUE    = "solicitudes.nueva";

    private Connection connection;
    private Channel    channel;
    private volatile boolean activo = false;

    /**
     * Inicia la escucha en un hilo daemon.
     *
     * @param onMensaje callback que recibe el cuerpo del mensaje (String JSON)
     */
    public void iniciar(Consumer<String> onMensaje) {
        Thread hilo = new Thread(() -> {
            try {
                ConnectionFactory factory = new ConnectionFactory();
                factory.setHost(HOST);
                factory.setPort(PORT);
                factory.setUsername(USER);
                factory.setPassword(PASS);
                factory.setAutomaticRecoveryEnabled(true);
                factory.setNetworkRecoveryInterval(5000);

                connection = factory.newConnection("autociclo-desktop");
                channel    = connection.createChannel();

                // Declarar cola por si no existe aún
                channel.queueDeclare(QUEUE, true, false, false, null);

                DeliverCallback deliver = (tag, msg) -> {
                    String body = new String(msg.getBody(), java.nio.charset.StandardCharsets.UTF_8);
                    Platform.runLater(() -> onMensaje.accept(body));
                };

                channel.basicConsume(QUEUE, true, deliver, tag -> {});
                activo = true;

            } catch (Exception e) {
                // Si RabbitMQ no está disponible, el listener falla silenciosamente
                System.err.println("[RabbitMQ] No se pudo conectar: " + e.getMessage());
            }
        });
        hilo.setDaemon(true);
        hilo.setName("rabbitmq-listener");
        hilo.start();
    }

    public void detener() {
        activo = false;
        try { if (channel    != null) channel.close();    } catch (Exception ignored) {}
        try { if (connection != null) connection.close(); } catch (Exception ignored) {}
    }

    public boolean isActivo() { return activo; }
}
