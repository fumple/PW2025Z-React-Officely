package com.officely.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name="password_reset_emails")
@Getter
public class PasswordResetEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @Setter
    private UserEntity user;

    @Setter
    @Column(nullable = false, length = 6, unique = true)
    private String code;

    @Setter
    @Column(nullable = false)
    private LocalDateTime expiresAt;
}
