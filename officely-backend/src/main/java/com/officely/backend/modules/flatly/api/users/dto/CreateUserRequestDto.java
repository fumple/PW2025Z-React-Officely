package com.officely.backend.modules.flatly.api.users.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;

import java.time.LocalDate;

@Getter
public class CreateUserRequestDto {
    @NotBlank(message = "First name is mandatory")
    private String firstName;
    @NotBlank(message = "Last name is mandatory")
    private String lastName;

    @NotBlank(message = "Email is mandatory")
    @Email
    private String email;

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
