package com.officely.backend.api.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class ResetPasswordEmailRequest {
    @NotBlank(message = "Email is mandatory")
    @Email
    private String email;
}
