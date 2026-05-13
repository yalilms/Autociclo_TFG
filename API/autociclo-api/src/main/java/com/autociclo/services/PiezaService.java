package com.autociclo.services;

import com.autociclo.dto.PiezaRequest;
import com.autociclo.models.Pieza;
import com.autociclo.repositories.PiezaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PiezaService {

    private final PiezaRepository piezaRepository;

    public List<Pieza> findAll() {
        return piezaRepository.findAll(Sort.by(Sort.Direction.DESC, "idPieza"));
    }

    public Pieza findById(Integer id) {
        return piezaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Pieza no encontrada: " + id));
    }

    public List<Pieza> buscar(String q, String categoria, String marca) {
        return piezaRepository.buscar(q, categoria, marca);
    }

    public List<Pieza> findStockBajo() {
        return piezaRepository.findStockBajo();
    }

    @Transactional
    public Pieza create(PiezaRequest req) {
        if (piezaRepository.existsByCodigoPieza(req.getCodigoPieza())) {
            throw new IllegalArgumentException("Código de pieza ya existe: " + req.getCodigoPieza());
        }
        Pieza p = new Pieza();
        mapFromRequest(p, req);
        return piezaRepository.save(p);
    }

    @Transactional
    public Pieza update(Integer id, PiezaRequest req) {
        Pieza p = findById(id);
        if (!p.getCodigoPieza().equals(req.getCodigoPieza()) && piezaRepository.existsByCodigoPieza(req.getCodigoPieza())) {
            throw new IllegalArgumentException("Código de pieza ya existe: " + req.getCodigoPieza());
        }
        mapFromRequest(p, req);
        return piezaRepository.save(p);
    }

    @Transactional
    public void delete(Integer id) {
        findById(id);
        piezaRepository.deleteById(id);
    }

    private void mapFromRequest(Pieza p, PiezaRequest req) {
        p.setCodigoPieza(req.getCodigoPieza());
        p.setNombre(req.getNombre());
        p.setCategoria(req.getCategoria());
        p.setPrecioVenta(req.getPrecioVenta());
        p.setStockDisponible(req.getStockDisponible() != null ? req.getStockDisponible() : 0);
        p.setStockMinimo(req.getStockMinimo() != null ? req.getStockMinimo() : 1);
        p.setUbicacionAlmacen(req.getUbicacionAlmacen());
        p.setCompatibleMarcas(req.getCompatibleMarcas());
        p.setImagen(req.getImagen());
        p.setDescripcion(req.getDescripcion());
    }
}
