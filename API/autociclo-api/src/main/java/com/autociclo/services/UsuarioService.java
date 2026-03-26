package com.autociclo.services;

import com.autociclo.dto.UsuarioRequest;
import com.autociclo.models.Rol;
import com.autociclo.models.Usuario;
import com.autociclo.repositories.RolRepository;
import com.autociclo.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    public List<Usuario> findAll() {
        return usuarioRepository.findAll();
    }

    public Usuario findById(Integer id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado: " + id));
    }

    @Transactional
    public Usuario create(UsuarioRequest req) {
        if (usuarioRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email ya registrado: " + req.getEmail());
        }
        Rol rol = rolRepository.findByNombre(req.getRolNombre())
                .orElseThrow(() -> new IllegalArgumentException("Rol no encontrado: " + req.getRolNombre()));
        Usuario u = new Usuario();
        u.setNombre(req.getNombre());
        u.setEmail(req.getEmail());
        u.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        u.setRol(rol);
        u.setActivo(req.getActivo() != null ? req.getActivo() : true);
        u.setFechaAlta(LocalDateTime.now());
        return usuarioRepository.save(u);
    }

    @Transactional
    public Usuario update(Integer id, UsuarioRequest req) {
        Usuario u = findById(id);
        u.setNombre(req.getNombre());
        if (!u.getEmail().equals(req.getEmail()) && usuarioRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email ya registrado: " + req.getEmail());
        }
        u.setEmail(req.getEmail());
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            u.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        }
        Rol rol = rolRepository.findByNombre(req.getRolNombre())
                .orElseThrow(() -> new IllegalArgumentException("Rol no encontrado: " + req.getRolNombre()));
        u.setRol(rol);
        if (req.getActivo() != null) u.setActivo(req.getActivo());
        return usuarioRepository.save(u);
    }

    @Transactional
    public void deactivate(Integer id) {
        Usuario u = findById(id);
        u.setActivo(false);
        usuarioRepository.save(u);
    }
}
