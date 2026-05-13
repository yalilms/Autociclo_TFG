package com.autociclo.services;

import com.autociclo.dto.VehiculoRequest;
import com.autociclo.models.Vehiculo;
import com.autociclo.repositories.VehiculoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VehiculoService {

    private final VehiculoRepository vehiculoRepository;

    public List<Vehiculo> findAll() {
        return vehiculoRepository.findAll(Sort.by(Sort.Direction.DESC, "idVehiculo"));
    }

    public Vehiculo findById(Integer id) {
        return vehiculoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vehículo no encontrado: " + id));
    }

    @Transactional
    public Vehiculo create(VehiculoRequest req) {
        if (vehiculoRepository.existsByMatricula(req.getMatricula())) {
            throw new IllegalArgumentException("Matrícula ya registrada: " + req.getMatricula());
        }
        Vehiculo v = new Vehiculo();
        mapFromRequest(v, req);
        return vehiculoRepository.save(v);
    }

    @Transactional
    public Vehiculo update(Integer id, VehiculoRequest req) {
        Vehiculo v = findById(id);
        if (!v.getMatricula().equals(req.getMatricula()) && vehiculoRepository.existsByMatricula(req.getMatricula())) {
            throw new IllegalArgumentException("Matrícula ya registrada: " + req.getMatricula());
        }
        mapFromRequest(v, req);
        return vehiculoRepository.save(v);
    }

    @Transactional
    public void delete(Integer id) {
        findById(id);
        vehiculoRepository.deleteById(id);
    }

    private void mapFromRequest(Vehiculo v, VehiculoRequest req) {
        v.setMatricula(req.getMatricula());
        v.setMarca(req.getMarca());
        v.setModelo(req.getModelo());
        v.setAnio(req.getAnio());
        v.setColor(req.getColor());
        v.setFechaEntrada(req.getFechaEntrada());
        v.setEstado(req.getEstado());
        v.setPrecioCompra(req.getPrecioCompra());
        v.setKilometraje(req.getKilometraje());
        v.setUbicacionGps(req.getUbicacionGps());
        v.setObservaciones(req.getObservaciones());
    }
}
