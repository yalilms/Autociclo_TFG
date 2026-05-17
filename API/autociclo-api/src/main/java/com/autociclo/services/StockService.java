package com.autociclo.services;

import com.autociclo.dto.MovimientoStockRequest;
import com.autociclo.messaging.RabbitMQPublisher;
import com.autociclo.models.MovimientoStock;
import com.autociclo.models.Pieza;
import com.autociclo.models.Usuario;
import com.autociclo.repositories.MovimientoStockRepository;
import com.autociclo.repositories.PiezaRepository;
import com.autociclo.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StockService {

    private final MovimientoStockRepository movimientoRepository;
    private final PiezaRepository piezaRepository;
    private final UsuarioRepository usuarioRepository;
    private final NotificacionService notificacionService;
    private final RabbitMQPublisher rabbitMQPublisher;

    public List<Pieza> getAlertas() {
        return piezaRepository.findStockBajo();
    }

    public List<MovimientoStock> getMovimientos(Integer idPieza) {
        return movimientoRepository.findByPiezaIdPiezaOrderByFechaDesc(idPieza);
    }

    @Transactional
    public MovimientoStock registrarMovimiento(MovimientoStockRequest req, String emailUsuario) {
        Pieza pieza = piezaRepository.findById(req.getIdPieza())
                .orElseThrow(() -> new IllegalArgumentException("Pieza no encontrada: " + req.getIdPieza()));
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .or(() -> usuarioRepository.findByEmail("empleado@autociclo.com"))
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        // Actualizar stock
        int nuevoStock;
        if ("entrada".equals(req.getTipo())) {
            nuevoStock = pieza.getStockDisponible() + req.getCantidad();
        } else if ("salida".equals(req.getTipo())) {
            nuevoStock = pieza.getStockDisponible() - req.getCantidad();
            if (nuevoStock < 0) {
                throw new IllegalArgumentException("Stock insuficiente. Disponible: " + pieza.getStockDisponible());
            }
        } else {
            throw new IllegalArgumentException("Tipo de movimiento inválido: " + req.getTipo());
        }
        pieza.setStockDisponible(nuevoStock);
        piezaRepository.save(pieza);

        // Registrar movimiento
        MovimientoStock mov = new MovimientoStock();
        mov.setPieza(pieza);
        mov.setTipo(req.getTipo());
        mov.setCantidad(req.getCantidad());
        mov.setUsuario(usuario);
        mov.setFecha(LocalDateTime.now());
        mov.setNotas(req.getNotas());
        MovimientoStock saved = movimientoRepository.save(mov);

        // Verificar alerta de stock bajo
        if (nuevoStock < pieza.getStockMinimo()) {
            rabbitMQPublisher.publicarAlertaStock(
                    pieza.getIdPieza(),
                    pieza.getCodigoPieza(),
                    pieza.getNombre(),
                    nuevoStock,
                    pieza.getStockMinimo()
            );
            // Notificar a admins y empleados
            usuarioRepository.findAll().stream()
                    .filter(u -> "ADMIN".equals(u.getRol().getNombre()) || "EMPLEADO".equals(u.getRol().getNombre()))
                    .forEach(u -> notificacionService.crearNotificacion(
                            u.getIdUsuario(),
                            "stock_bajo",
                            "Stock bajo: " + pieza.getNombre() + " (" + pieza.getCodigoPieza() + ") — " + nuevoStock + " uds"
                    ));
        }

        return saved;
    }
}
