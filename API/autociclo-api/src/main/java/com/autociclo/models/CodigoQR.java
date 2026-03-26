package com.autociclo.models;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "CODIGOS_QR")
public class CodigoQR {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_qr")
    private Integer idQr;

    @Column(name = "codigo_unico", nullable = false, unique = true, length = 100)
    private String codigoUnico;

    // 'pieza','vehiculo'
    @Column(nullable = false, length = 10)
    private String tipo;

    @Column(name = "id_referencia", nullable = false)
    private Integer idReferencia;

    @Column(name = "fecha_generacion", nullable = false)
    private LocalDateTime fechaGeneracion;
}
