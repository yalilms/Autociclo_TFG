package com.autociclo.repositories;

import com.autociclo.models.NegociacionHistorial;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NegociacionHistorialRepository extends JpaRepository<NegociacionHistorial, Integer> {
    List<NegociacionHistorial> findBySolicitudIdSolicitudOrderByRondaAsc(Integer idSolicitud);
}
