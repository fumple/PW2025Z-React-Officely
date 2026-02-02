package com.officely.backend.modules.flatly.api.users.dto;

import com.officely.backend.api.validation.Age;
import jakarta.validation.constraints.*;
import lombok.Getter;
import org.hibernate.validator.constraints.Length;

import java.time.LocalDate;

@Getter
public class CreateUserRequestDto {
    @NotBlank(message = "First name is mandatory")
    @Length(max = 32)
    private String firstName;
    @NotBlank(message = "Last name is mandatory")
    @Length(max = 32)
    private String lastName;

    @NotBlank(message = "Email is mandatory")
    @Email
    @Length(max = 256)
    private String email;

    @NotNull(message = "Date of birth is mandatory")
    @Age(min = 15)
    private LocalDate dateOfBirth;

    @NotBlank(message = "Nationality is mandatory")
    @Pattern(regexp = "^[A-Z]{2}$")
    private String nationality;

    @NotBlank(message = "Phone number is mandatory")
    @Pattern(regexp = "^\\+[1-9]\\d{1,14}$")
    private String phoneNumber;
}
