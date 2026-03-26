package com.autociclo.repositories;

import com.autociclo.models.Cliente;
import com.autociclo.models.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, Integer> {
    Optional<Cliente> findByUsuario(Usuario usuario);
}
