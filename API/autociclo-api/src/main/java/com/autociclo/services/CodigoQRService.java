package com.autociclo.services;

import com.autociclo.models.CodigoQR;
import com.autociclo.repositories.CodigoQRRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CodigoQRService {

    private final CodigoQRRepository codigoQRRepository;

    public List<CodigoQR> findAll() {
        return codigoQRRepository.findAll();
    }

    public CodigoQR findByCodigo(String codigo) {
        return codigoQRRepository.findByCodigoUnico(codigo)
                .orElseThrow(() -> new IllegalArgumentException("Código QR no encontrado: " + codigo));
    }

    public List<CodigoQR> findByTipoYReferencia(String tipo, Integer idReferencia) {
        return codigoQRRepository.findByTipoAndIdReferencia(tipo, idReferencia);
    }

    @Transactional
    public CodigoQR generate(String tipo, Integer idReferencia) {
        String prefix = "pieza".equals(tipo) ? "QR-PIE-" : "QR-VEH-";
        String codigo = prefix + String.format("%05d", idReferencia) + "-" + System.currentTimeMillis();

        CodigoQR qr = new CodigoQR();
        qr.setCodigoUnico(codigo);
        qr.setTipo(tipo);
        qr.setIdReferencia(idReferencia);
        qr.setFechaGeneracion(LocalDateTime.now());
        return codigoQRRepository.save(qr);
    }
}
