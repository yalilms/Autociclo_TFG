package com.autociclo.repositories;

import com.autociclo.models.MovimientoStock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MovimientoStockRepository extends JpaRepository<MovimientoStock, Integer> {
    List<MovimientoStock> findByPiezaIdPiezaOrderByFechaDesc(Integer idPieza);
}
