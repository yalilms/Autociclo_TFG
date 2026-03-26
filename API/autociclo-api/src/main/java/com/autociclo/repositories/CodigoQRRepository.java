package com.autociclo.repositories;

import com.autociclo.models.CodigoQR;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CodigoQRRepository extends JpaRepository<CodigoQR, Integer> {
    Optional<CodigoQR> findByCodigoUnico(String codigoUnico);
    List<CodigoQR> findByTipoAndIdReferencia(String tipo, Integer idReferencia);
}
