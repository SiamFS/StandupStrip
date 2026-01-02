package com.siamcode.backend.controller;

import com.siamcode.backend.dto.response.UserResponse;
import com.siamcode.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001",
        "http://localhost:5173" }, allowCredentials = "true")
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        // TODO: Implement get user by ID
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id,
            @RequestParam String name) {
        // TODO: Implement update user
        return ResponseEntity.ok(userService.updateUser(id, name));
    }
}
