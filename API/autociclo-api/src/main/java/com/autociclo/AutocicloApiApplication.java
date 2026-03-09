package com.autociclo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Punto de entrada de la API REST de AutoCiclo.
 * Ecosistema multiplataforma de gestión de desguace.
 *
 * @author Yalil Musa Talhaoui
 * @version 1.0.0
 */
@SpringBootApplication
public class AutocicloApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(AutocicloApiApplication.class, args);
    }
}
