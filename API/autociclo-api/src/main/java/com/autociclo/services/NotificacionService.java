package com.autociclo.services;

import com.autociclo.models.Notificacion;
import com.autociclo.models.Usuario;
import com.autociclo.repositories.NotificacionRepository;
import com.autociclo.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;
    private final UsuarioRepository usuarioRepository;

    public List<Notificacion> findByUsuario(String email) {
        Usuario usuario = getUsuario(email);
        return notificacionRepository.findByUsuarioIdUsuarioOrderByFechaCreacionDesc(usuario.getIdUsuario());
    }

    public List<Notificacion> findNoLeidasByUsuario(String email) {
        Usuario usuario = getUsuario(email);
        return notificacionRepository.findByUsuarioIdUsuarioAndLeidaFalseOrderByFechaCreacionDesc(usuario.getIdUsuario());
    }

    @Transactional
    public void marcarLeida(Integer idNotif, String email) {
        Notificacion n = notificacionRepository.findById(idNotif)
                .orElseThrow(() -> new IllegalArgumentException("Notificación no encontrada: " + idNotif));
        if (!n.getUsuario().getEmail().equals(email)) {
            throw new SecurityException("No autorizado");
        }
        n.setLeida(true);
        notificacionRepository.save(n);
    }

    @Transactional
    public Notificacion crearNotificacion(Integer idUsuario, String tipo, String mensaje) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado: " + idUsuario));
        Notificacion n = new Notificacion();
        n.setUsuario(usuario);
        n.setTipo(tipo);
        n.setMensaje(mensaje);
        n.setLeida(false);
        n.setFechaCreacion(LocalDateTime.now());
        return notificacionRepository.save(n);
    }

    private Usuario getUsuario(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + email));
    }
}
