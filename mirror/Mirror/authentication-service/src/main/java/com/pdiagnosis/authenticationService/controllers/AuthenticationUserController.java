package com.pdiagnosis.authenticationService.controllers;

import com.pdiagnosis.AuthenticationUser;
import com.pdiagnosis.authenticationService.services.AuthenticationUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth/users")
@RequiredArgsConstructor
public class AuthenticationUserController {

    private final AuthenticationUserService authenticationUserService;
    private final PasswordEncoder passwordEncoder;

    /**
     * Получить всех пользователей
     */
    @GetMapping
    public ResponseEntity<List<AuthenticationUser>> getAllUsers() {
        List<AuthenticationUser> users = authenticationUserService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * Получить пользователя по ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Object> getUserById(@PathVariable Long id) {
        Optional<AuthenticationUser> userOpt = authenticationUserService.findById(id);
        return userOpt.<ResponseEntity<Object>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User not found"));
    }


    /**
     * Создать нового пользователя
     */
    @PostMapping
    public ResponseEntity<AuthenticationUser> createUser(@RequestBody AuthenticationUser user) {
        user.setId(null);
        AuthenticationUser createdUser = authenticationUserService.createUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    /**
     * Обновить существующего пользователя (например, пароль или активность)
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id,
                                        @RequestBody AuthenticationUser updatedUser) {
        updatedUser.setId(null);
        Optional<AuthenticationUser> userOpt = authenticationUserService.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        AuthenticationUser user = userOpt.get();

        // Обновляем пароль, если указан
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
            authenticationUserService.updatePassword(user, updatedUser.getPassword());
        }

        // Обновляем активность
        user.setActive(updatedUser.isActive());

        AuthenticationUser savedUser = authenticationUserService.updateUser(user);
        return ResponseEntity.ok(savedUser);
    }

    /**
     * Удалить пользователя
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        Optional<AuthenticationUser> userOpt = authenticationUserService.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        authenticationUserService.deactivateUser(userOpt.get());
        return ResponseEntity.noContent().build();
    }
}
