package com.autociclo.repositories;

import com.autociclo.models.Pieza;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PiezaRepository extends JpaRepository<Pieza, Integer> {
    Optional<Pieza> findByCodigoPieza(String codigoPieza);
    boolean existsByCodigoPieza(String codigoPieza);
    List<Pieza> findByCategoria(String categoria);
    List<Pieza> findByStockDisponibleGreaterThan(int stock);

    @Query("SELECT p FROM Pieza p WHERE " +
           "(:q IS NULL OR LOWER(p.nombre) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(p.codigoPieza) LIKE LOWER(CONCAT('%', :q, '%'))) " +
           "AND (:categoria IS NULL OR p.categoria = :categoria) " +
           "AND (:marca IS NULL OR LOWER(p.compatibleMarcas) LIKE LOWER(CONCAT('%', :marca, '%')))")
    List<Pieza> buscar(@Param("q") String q,
                       @Param("categoria") String categoria,
                       @Param("marca") String marca);

    @Query("SELECT p FROM Pieza p WHERE p.stockDisponible < p.stockMinimo")
    List<Pieza> findStockBajo();
}
