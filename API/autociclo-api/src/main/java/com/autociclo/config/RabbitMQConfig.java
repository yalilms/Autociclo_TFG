package com.autociclo.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String QUEUE_SOLICITUDES = "solicitudes.nueva";
    public static final String QUEUE_STOCK       = "stock.alerta";
    public static final String EXCHANGE          = "autociclo.exchange";
    public static final String RK_SOLICITUDES    = "solicitudes.nueva";
    public static final String RK_STOCK          = "stock.alerta";

    @Bean
    public Queue queueSolicitudes() {
        return QueueBuilder.durable(QUEUE_SOLICITUDES).build();
    }

    @Bean
    public Queue queueStock() {
        return QueueBuilder.durable(QUEUE_STOCK).build();
    }

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(EXCHANGE);
    }

    @Bean
    public Binding bindingSolicitudes(Queue queueSolicitudes, TopicExchange exchange) {
        return BindingBuilder.bind(queueSolicitudes).to(exchange).with(RK_SOLICITUDES);
    }

    @Bean
    public Binding bindingStock(Queue queueStock, TopicExchange exchange) {
        return BindingBuilder.bind(queueStock).to(exchange).with(RK_STOCK);
    }

    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter());
        return template;
    }
}
