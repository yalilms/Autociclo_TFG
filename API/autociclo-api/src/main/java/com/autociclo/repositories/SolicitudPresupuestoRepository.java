package com.autociclo.repositories;

import com.autociclo.models.SolicitudPresupuesto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SolicitudPresupuestoRepository extends JpaRepository<SolicitudPresupuesto, Integer> {
    List<SolicitudPresupuesto> findByClienteIdCliente(Integer idCliente);
    List<SolicitudPresupuesto> findByEstado(String estado);
}
