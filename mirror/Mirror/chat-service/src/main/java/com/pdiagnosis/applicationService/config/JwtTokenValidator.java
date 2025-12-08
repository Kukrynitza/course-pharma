package com.pdiagnosis.applicationService.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtTokenValidator {

    @Value("${jwt.secret}")
    private String secretKey;

    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(secretKey).parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String getUsernameFromToken(String token) {
        return getClaims(token).getSubject();
    }

    public List<GrantedAuthority> getAuthoritiesFromToken(String token) {
        Claims claims = getClaims(token);
        List<String> roles = claims.get("roles", List.class); // Предполагаем, что roles в claims как List<String>
        return roles.stream().map(SimpleGrantedAuthority::new).collect(Collectors.toList());
    }

    private Claims getClaims(String token) {
        return Jwts.parser().setSigningKey(secretKey).parseClaimsJws(token).getBody();
    }

    // Дополнительно: проверка expiration
    public boolean isTokenExpired(String token) {
        return getClaims(token).getExpiration().before(new Date());
    }
}