package com.officely.backend.api.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import org.hibernate.validator.constraints.Length;

@Getter
public class LoginRequest {
    @NotBlank
    private String type;

    @NotBlank(message = "Email is mandatory")
    @Length(max = 256)
    @Email
    private String email;

    @NotBlank(message = "Password is mandatory")
    @Length(max = 64)
    private String password;
}
