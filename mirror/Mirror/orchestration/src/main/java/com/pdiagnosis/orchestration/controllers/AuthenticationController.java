package com.pdiagnosis.orchestration.controllers;

import com.pdiagnosis.AuthenticationUser;
import com.pdiagnosis.User;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final RestTemplate restTemplate;
    @Value("${services.auth.reg.url}")
    private String authRegServiceUrl;
    @Value("${services.user.reg.url}")
    private   String userServiceUrl;
    @Value("${services.auth.del.url}")
    private   String authUserServiceDelUrl;
    @Value("${services.auth.log.url}")
    private   String authServiceUrl;
    // DTO для запроса логина
    public static class LoginRequest {
        public String username;
        public String password;

        // Геттеры и сеттеры
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class LoginResponse {
        private String token;
        private Long userId;

        public LoginResponse() {} // нужен для Jackson

        public LoginResponse(String token, Long userId) {
            this.token = token;
            this.userId = userId;
        }

        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
    }


    // DTO для запроса регистрации
    public static class RegisterRequest {
        public String username;
        public String password;
        public String email;


        // Геттеры и сеттеры
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getEmail() { return email; }

    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        // Пересылка запроса логина в authentication-service
        ResponseEntity<LoginResponse> response = restTemplate.postForEntity(
                authServiceUrl, loginRequest, LoginResponse.class);

        if (response.getStatusCode() == HttpStatus.OK) {
            return ResponseEntity.ok(response.getBody());
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Неверное имя пользователя или пароль");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
        // Создаем AuthenticationUser для authentication-service
        AuthenticationUser authUser = new AuthenticationUser();
        authUser.setUsername(registerRequest.getUsername());
        authUser.setPassword(registerRequest.getPassword());

        // Регистрация в authentication-service
        ResponseEntity<AuthenticationUser> authResponse = restTemplate.postForEntity(
                authRegServiceUrl, authUser, AuthenticationUser.class);

        if (authResponse.getStatusCode() == HttpStatus.CONFLICT) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Имя пользователя уже существует");
        }

        // Если пользователь успешно создан в authentication-service, регистрируем в user-service
        if (authResponse.getStatusCode() == HttpStatus.OK) {
            // Создаем User для user-service
            User user = new User();
            user.setUsername(registerRequest.getUsername());
            user.setEmail(registerRequest.getEmail());
            user.setActive(true); // Устанавливаем по умолчанию, как в модели User

            ResponseEntity<User> userResponse = restTemplate.postForEntity(
                    userServiceUrl, user, User.class);

            if (userResponse.getStatusCode() == HttpStatus.OK) {
                return ResponseEntity.status(HttpStatus.CREATED).body(userResponse.getBody());
            } else {
                // Откат регистрации в authentication-service
                // В продакшене рекомендуется использовать распределенные транзакции
                String deleteAuthUserUrl = authUserServiceDelUrl + registerRequest.getUsername();
                restTemplate.delete(deleteAuthUserUrl);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Не удалось зарегистрировать пользователя в user-service");
            }
        }

        return ResponseEntity.status(authResponse.getStatusCode()).body(authResponse.getBody());
    }
}