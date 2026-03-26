package com.autociclo.repositories;

import com.autociclo.models.DetalleSolicitud;
import com.autociclo.models.DetalleSolicitudId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DetalleSolicitudRepository extends JpaRepository<DetalleSolicitud, DetalleSolicitudId> {
    List<DetalleSolicitud> findByIdIdSolicitud(Integer idSolicitud);
}
