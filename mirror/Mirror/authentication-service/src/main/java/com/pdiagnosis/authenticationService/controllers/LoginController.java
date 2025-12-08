package com.pdiagnosis.authenticationService.controllers;
import com.pdiagnosis.AuthenticationUser;
import com.pdiagnosis.authenticationService.config.JwtTokenGenerator;
import com.pdiagnosis.authenticationService.services.AuthenticationUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class LoginController {

    private final AuthenticationUserService authenticationUserService;
    private final JwtTokenGenerator jwtTokenGenerator;

    private final PasswordEncoder passwordEncoder;

    // DTO для запроса логина
    public static class LoginRequest {
        public String username;
        public String password;
    }

    // DTO для ответа с токеном и id
    public static class LoginResponse {
        private String token;
        private Long userId;

        public LoginResponse(String token, Long userId) {
            this.token = token;
            this.userId = userId;
        }

        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        Optional<AuthenticationUser> authUserOpt =
                authenticationUserService.findByUsername(loginRequest.username);

        if (authUserOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid username or password");
        }

        AuthenticationUser authUser = authUserOpt.get();

        if (!passwordEncoder.matches(loginRequest.password, authUser.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid username or password");
        }

        String token = jwtTokenGenerator.generateToken(authUser.getUsername());

        // Возвращаем токен и id пользователя
        return ResponseEntity.ok(new LoginResponse(token, authUser.getId()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthenticationUser newUser) {

        if (authenticationUserService.existsByUsername(newUser.getUsername())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Username already exists");
        }
        AuthenticationUser created = authenticationUserService.createUser(newUser);
        return ResponseEntity.ok().build();
    }
}
