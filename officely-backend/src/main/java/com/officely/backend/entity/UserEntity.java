package com.officely.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Table(name = "users", uniqueConstraints = @UniqueConstraint(name = "uk_users_type_email", columnNames = {"type", "email"}))
public class UserEntity {
    @Setter
    @Column(nullable = false)
    private UserType type;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @Column(nullable = false)
    private String email;

    @Setter
    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Setter
    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Setter
    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Setter
    @Column(length = 2, nullable = false)
    private String nationality;

    @Setter
    @Column(name = "phone_number", length = 16, nullable = false)
    private String phoneNumber;

    @Setter
    @Column(length = 64)
    private String password;

    @PrePersist @PreUpdate private void prepare(){
        this.email = email == null ? null : email.toLowerCase();
    }
}
