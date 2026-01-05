package com.siamcode.backend.controller;

import com.siamcode.backend.dto.request.LoginRequest;
import com.siamcode.backend.dto.request.RegisterRequest;
import com.siamcode.backend.dto.request.VerifyPasswordRequest;
import com.siamcode.backend.dto.response.AuthResponse;
import com.siamcode.backend.security.SecurityHelper;
import com.siamcode.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final SecurityHelper securityHelper;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-password")
    public ResponseEntity<Void> verifyPassword(@Valid @RequestBody VerifyPasswordRequest request) {
        Long userId = securityHelper.getCurrentUserId();
        authService.verifyPassword(userId, request.getPassword());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/verify")
    public ResponseEntity<String> verifyEmail(@RequestParam String token) {
        authService.verifyEmail(token);
        return ResponseEntity.ok("Email verified successfully. You can now login.");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@RequestParam String email) {
        authService.initiatePasswordReset(email);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@RequestParam String token, @RequestParam String password) {
        authService.resetPassword(token, password);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<String> resendVerification() {
        Long userId = securityHelper.getCurrentUserId();
        authService.resendVerificationEmail(userId);
        return ResponseEntity.ok("Verification email sent successfully.");
    }
}
