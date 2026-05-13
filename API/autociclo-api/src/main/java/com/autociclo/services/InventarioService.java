package com.autociclo.services;

import com.autociclo.dto.InventarioRequest;
import com.autociclo.models.InventarioPieza;
import com.autociclo.models.InventarioPiezaId;
import com.autociclo.models.Pieza;
import com.autociclo.models.Vehiculo;
import com.autociclo.repositories.InventarioPiezaRepository;
import com.autociclo.repositories.PiezaRepository;
import com.autociclo.repositories.VehiculoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventarioService {

    private final InventarioPiezaRepository inventarioRepository;
    private final VehiculoRepository vehiculoRepository;
    private final PiezaRepository piezaRepository;

    @Transactional(readOnly = true)
    public List<InventarioPieza> findAll() {
        return inventarioRepository.findAll();
    }

    public List<InventarioPieza> findByVehiculo(Integer idVehiculo) {
        return inventarioRepository.findByIdIdVehiculo(idVehiculo);
    }

    public List<InventarioPieza> findByPieza(Integer idPieza) {
        return inventarioRepository.findByIdIdPieza(idPieza);
    }

    @Transactional
    public InventarioPieza create(InventarioRequest req) {
        Vehiculo vehiculo = vehiculoRepository.findById(req.getIdVehiculo())
                .orElseThrow(() -> new IllegalArgumentException("Vehículo no encontrado: " + req.getIdVehiculo()));
        Pieza pieza = piezaRepository.findById(req.getIdPieza())
                .orElseThrow(() -> new IllegalArgumentException("Pieza no encontrada: " + req.getIdPieza()));

        InventarioPiezaId id = new InventarioPiezaId(req.getIdVehiculo(), req.getIdPieza());
        InventarioPieza inv = new InventarioPieza();
        inv.setId(id);
        inv.setVehiculo(vehiculo);
        inv.setPieza(pieza);
        inv.setCantidad(req.getCantidad());
        inv.setEstadoPieza(req.getEstadoPieza());
        inv.setFechaExtraccion(req.getFechaExtraccion());
        inv.setPrecioUnitario(req.getPrecioUnitario());
        inv.setNotas(req.getNotas());

        pieza.setStockDisponible(pieza.getStockDisponible() + req.getCantidad());
        piezaRepository.save(pieza);

        return inventarioRepository.save(inv);
    }

    @Transactional
    public InventarioPieza update(Integer idVehiculo, Integer idPieza, InventarioRequest req) {
        InventarioPiezaId key = new InventarioPiezaId(idVehiculo, idPieza);
        InventarioPieza inv = inventarioRepository.findById(key)
                .orElseThrow(() -> new IllegalArgumentException("Registro de inventario no encontrado"));

        int diferencia = req.getCantidad() - inv.getCantidad();
        Pieza pieza = inv.getPieza();
        pieza.setStockDisponible(Math.max(0, pieza.getStockDisponible() + diferencia));
        piezaRepository.save(pieza);

        inv.setCantidad(req.getCantidad());
        inv.setEstadoPieza(req.getEstadoPieza());
        inv.setFechaExtraccion(req.getFechaExtraccion());
        inv.setPrecioUnitario(req.getPrecioUnitario());
        inv.setNotas(req.getNotas());
        return inventarioRepository.save(inv);
    }

    @Transactional
    public void delete(Integer idVehiculo, Integer idPieza) {
        InventarioPiezaId key = new InventarioPiezaId(idVehiculo, idPieza);
        InventarioPieza inv = inventarioRepository.findById(key)
                .orElseThrow(() -> new IllegalArgumentException("Registro de inventario no encontrado"));

        Pieza pieza = inv.getPieza();
        pieza.setStockDisponible(Math.max(0, pieza.getStockDisponible() - inv.getCantidad()));
        piezaRepository.save(pieza);

        inventarioRepository.deleteById(key);
    }
}
