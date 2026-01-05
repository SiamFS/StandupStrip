package com.siamcode.backend.controller;

import com.siamcode.backend.dto.request.UpdateUserRequest;
import com.siamcode.backend.dto.response.UserResponse;
import com.siamcode.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id,
            @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(userService.updateUser(id, request.getName()));
    }
}
