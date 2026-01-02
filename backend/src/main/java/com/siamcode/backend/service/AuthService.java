package com.siamcode.backend.service;

import com.siamcode.backend.dto.request.LoginRequest;
import com.siamcode.backend.dto.request.RegisterRequest;
import com.siamcode.backend.dto.response.AuthResponse;
import com.siamcode.backend.dto.response.UserResponse;
import com.siamcode.backend.entity.User;
import com.siamcode.backend.exception.UnauthorizedException;
import com.siamcode.backend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        UserResponse userResponse = userService.registerUser(request);
        String token = jwtUtil.generateToken(userResponse.getId());
        return new AuthResponse(token, userResponse);
    }

    public AuthResponse login(LoginRequest request) {
        // Find user by email
        User user = userService.findByEmail(request.getEmail());

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getId());
        UserResponse userResponse = userService.getUserById(user.getId());

        return new AuthResponse(token, userResponse);
    }

    public Long validateToken(String token) {
        if (!jwtUtil.validateToken(token)) {
            throw new UnauthorizedException("Invalid or expired token");
        }
        return jwtUtil.getUserIdFromToken(token);
    }
}
