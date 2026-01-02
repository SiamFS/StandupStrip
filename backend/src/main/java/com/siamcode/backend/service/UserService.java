package com.siamcode.backend.service;

import com.siamcode.backend.dto.request.RegisterRequest;
import com.siamcode.backend.dto.response.UserResponse;
import com.siamcode.backend.entity.User;
import com.siamcode.backend.exception.BadRequestException;
import com.siamcode.backend.exception.ResourceNotFoundException;
import com.siamcode.backend.repository.UserRepository;
import com.siamcode.backend.util.EntityMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EntityMapper entityMapper;

    @Transactional
    public UserResponse registerUser(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        // Create new user
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));

        User savedUser = userRepository.save(user);
        return entityMapper.toUserResponse(savedUser);
    }

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return entityMapper.toUserResponse(user);
    }

    @Transactional
    public UserResponse updateUser(Long id, String name) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setName(name);
        User updatedUser = userRepository.save(user);
        return entityMapper.toUserResponse(updatedUser);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }
}
