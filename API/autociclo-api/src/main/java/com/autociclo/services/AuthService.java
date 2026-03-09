package com.autociclo.services;

import com.autociclo.dto.AuthResponse;
import com.autociclo.dto.LoginRequest;
import com.autociclo.dto.RegisterRequest;
import com.autociclo.models.Cliente;
import com.autociclo.models.Rol;
import com.autociclo.models.Usuario;
import com.autociclo.repositories.ClienteRepository;
import com.autociclo.repositories.RolRepository;
import com.autociclo.repositories.UsuarioRepository;
import com.autociclo.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final ClienteRepository clienteRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        Usuario usuario = usuarioRepository.findByEmail(request.getEmail()).orElseThrow();
        String token = jwtUtil.generateToken(usuario.getEmail(), usuario.getRol().getNombre());

        return new AuthResponse(token, usuario.getEmail(), usuario.getNombre(), usuario.getRol().getNombre());
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email ya registrado: " + request.getEmail());
        }

        Rol rolCliente = rolRepository.findByNombre("CLIENTE")
                .orElseThrow(() -> new IllegalStateException("Rol CLIENTE no encontrado en BD"));

        Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre());
        usuario.setEmail(request.getEmail());
        usuario.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        usuario.setRol(rolCliente);
        usuario.setActivo(true);
        usuario.setFechaAlta(LocalDateTime.now());
        usuarioRepository.save(usuario);

        Cliente cliente = new Cliente();
        cliente.setUsuario(usuario);
        cliente.setTelefono(request.getTelefono());
        cliente.setDireccion(request.getDireccion());
        cliente.setNif(request.getNif());
        clienteRepository.save(cliente);

        String token = jwtUtil.generateToken(usuario.getEmail(), "CLIENTE");
        return new AuthResponse(token, usuario.getEmail(), usuario.getNombre(), "CLIENTE");
    }
}
