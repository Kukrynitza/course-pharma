package com.pdiagnosis.authenticationService.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

import com.pdiagnosis.AuthenticationUser;
public interface AuthenticationUserRepository extends JpaRepository<AuthenticationUser, Long> {

    Optional<AuthenticationUser> findByUsername(String username);

    boolean existsByUsername(String username);
}
