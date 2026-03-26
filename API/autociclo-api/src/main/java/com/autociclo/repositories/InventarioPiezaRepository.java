package com.autociclo.repositories;

import com.autociclo.models.InventarioPieza;
import com.autociclo.models.InventarioPiezaId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InventarioPiezaRepository extends JpaRepository<InventarioPieza, InventarioPiezaId> {
    List<InventarioPieza> findByIdIdVehiculo(Integer idVehiculo);
    List<InventarioPieza> findByIdIdPieza(Integer idPieza);
}
