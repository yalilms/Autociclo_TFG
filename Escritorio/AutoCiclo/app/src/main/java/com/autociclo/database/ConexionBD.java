package com.autociclo.database;

import java.io.InputStream;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.Properties;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

public class ConexionBD {

    private static HikariDataSource dataSource;

    static {
        Properties props = new Properties();
        try (InputStream input = ConexionBD.class.getClassLoader()
                .getResourceAsStream("database.properties")) {

            if (input == null) {
                throw new RuntimeException("No se encontró database.properties");
            }

            props.load(input);

            HikariConfig config = new HikariConfig();
            config.setJdbcUrl("jdbc:mysql://" + props.getProperty("db.host") + ":" +
                    props.getProperty("db.port") + "/" + props.getProperty("db.name") +
                    "?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true");
            config.setUsername(props.getProperty("db.user"));
            config.setPassword(props.getProperty("db.password"));

            // Configuraciones óptimas para conexiones remotas lentas
            config.setMaximumPoolSize(10); // Máximo 10 conexiones simultáneas
            config.setMinimumIdle(2); // Mantener al menos 2 listas para usar
            config.setConnectionTimeout(30000); // 30 segundos para conectar
            config.setIdleTimeout(600000); // 10 minutos antes de cerrar por inactividad
            config.setMaxLifetime(1800000); // 30 minutos de vida máxima

            dataSource = new HikariDataSource(config);

        } catch (Exception e) {
            throw new RuntimeException("Error al cargar configuración de BD", e);
        }
    }

    public static Connection getConexion() throws SQLException {
        return dataSource.getConnection();
    }

    // Método para cerrar el pool al salir de la aplicación
    public static void cerrarPool() {
        if (dataSource != null) {
            dataSource.close();
        }
    }
}