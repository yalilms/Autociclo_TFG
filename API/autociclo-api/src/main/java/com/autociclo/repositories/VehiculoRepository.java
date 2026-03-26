package com.autociclo.repositories;

import com.autociclo.models.Vehiculo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VehiculoRepository extends JpaRepository<Vehiculo, Integer> {
    Optional<Vehiculo> findByMatricula(String matricula);
    boolean existsByMatricula(String matricula);
    List<Vehiculo> findByEstado(String estado);
}
