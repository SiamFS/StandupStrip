package com.siamcode.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "teams")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Long ownerUserId;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private boolean deleted = false;

    @Column(unique = true)
    private String inviteCode;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (inviteCode == null) {
            inviteCode = java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }
    }
}
