package com.autociclo.repositories;

import com.autociclo.models.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificacionRepository extends JpaRepository<Notificacion, Integer> {
    List<Notificacion> findByUsuarioIdUsuarioOrderByFechaCreacionDesc(Integer idUsuario);
    List<Notificacion> findByUsuarioIdUsuarioAndLeidaFalseOrderByFechaCreacionDesc(Integer idUsuario);
}
