package com.siamcode.backend.service;

import com.siamcode.backend.dto.request.LoginRequest;
import com.siamcode.backend.dto.request.RegisterRequest;
import com.siamcode.backend.dto.response.AuthResponse;
import com.siamcode.backend.dto.response.UserResponse;
import com.siamcode.backend.entity.User;
import com.siamcode.backend.exception.BadRequestException;
import com.siamcode.backend.exception.UnauthorizedException;
import com.siamcode.backend.repository.UserRepository;
import com.siamcode.backend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserService userService;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        UserResponse userResponse = userService.registerUser(request);

        // Generate verification token
        String token = java.util.UUID.randomUUID().toString();
        User user = userService.findUserEntityById(userResponse.getId());
        user.setVerificationToken(token);
        user.setTokenExpiry(java.time.LocalDateTime.now().plusHours(24));

        // Send verification email - only require verification if email sends
        // successfully
        if (emailService.isConfigured()) {
            try {
                emailService.sendVerificationEmail(user.getEmail(), user.getName(), token);
                user.setVerified(false); // Email sent - require verification
                System.out.println("==> Verification email sent to: " + user.getEmail());
            } catch (Exception e) {
                user.setVerified(true); // Email failed - auto-verify for dev
                System.err.println("==> Email failed, user auto-verified: " + e.getMessage());
            }
        } else {
            user.setVerified(true); // Email not configured - auto-verify for dev
            System.out.println("==> Email not configured, user auto-verified");
        }

        userService.saveUser(user);

        String jwtToken = jwtUtil.generateToken(userResponse.getId());
        return new AuthResponse(jwtToken, userResponse);
    }

    public AuthResponse login(LoginRequest request) {
        // Find user by email
        User user = userService.findByEmail(request.getEmail());

        // Check if verified
        if (!user.isVerified()) {
            throw new UnauthorizedException("Email not verified. Please check your inbox.");
        }

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getId());
        UserResponse userResponse = userService.getUserById(user.getId());

        return new AuthResponse(token, userResponse);
    }

    @Transactional
    public void verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid or expired verification token"));

        if (user.getTokenExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new BadRequestException("Verification token has expired");
        }

        user.setVerified(true);
        user.setVerificationToken(null);
        user.setTokenExpiry(null);
        userRepository.save(user);
    }

    public void initiatePasswordReset(String email) {
        User user = userService.findByEmail(email);

        String token = java.util.UUID.randomUUID().toString();
        user.setPasswordResetToken(token);
        user.setTokenExpiry(java.time.LocalDateTime.now().plusHours(1));
        userRepository.save(user);

        emailService.sendPasswordResetEmail(user.getEmail(), user.getName(), token);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByPasswordResetToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid or expired password reset token"));

        if (user.getTokenExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new BadRequestException("Password reset token has expired");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setTokenExpiry(null);
        userRepository.save(user);
    }

    public Long validateToken(String token) {
        if (!jwtUtil.validateToken(token)) {
            throw new UnauthorizedException("Invalid or expired token");
        }
        return jwtUtil.getUserIdFromToken(token);
    }

    public void verifyPassword(Long userId, String password) {
        User user = userService.findUserEntityById(userId);
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid password");
        }
    }

    @Transactional
    public void resendVerificationEmail(Long userId) {
        User user = userService.findUserEntityById(userId);

        if (user.isVerified()) {
            throw new BadRequestException("Email is already verified");
        }

        // Generate new verification token
        String token = java.util.UUID.randomUUID().toString();
        user.setVerificationToken(token);
        user.setTokenExpiry(java.time.LocalDateTime.now().plusHours(24));
        userRepository.save(user);

        // Send verification email
        emailService.sendVerificationEmail(user.getEmail(), user.getName(), token);
    }
}
