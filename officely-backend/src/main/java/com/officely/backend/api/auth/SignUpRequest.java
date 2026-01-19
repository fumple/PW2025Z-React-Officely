package com.officely.backend.api.auth;

import jakarta.validation.constraints.*;
import lombok.Getter;
import org.mapstruct.Mapping;

import java.time.LocalDate;

@Getter
public class SignUpRequest {
    @Pattern(regexp = "^admin$", message = "Account type must be equal to admin")
    private String type;
    @NotBlank(message = "First name is mandatory")
    private String firstName;
    @NotBlank(message = "Last name is mandatory")
    private String lastName;

    @NotBlank(message = "Email is mandatory")
    @Email
    private String email;
    @NotBlank(message = "Password is mandatory")
    @Size(min = 8, max = 64)
    private String password;

    @NotNull(message = "Date of birth is mandatory")
    @Past
    private LocalDate dateOfBirth;

    @NotBlank(message = "Nationality is mandatory")
    @Pattern(regexp = "^[A-Z]{2}$")
    private String nationality;

    @NotBlank(message = "Phone number is mandatory")
    @Pattern(regexp = "^\\+[1-9]\\d{1,14}$")
    private String phoneNumber;
}
