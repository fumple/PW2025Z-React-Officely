package com.officely.backend.api.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class ResetPasswordRequest {
    @NotBlank(message = "Email is mandatory")
    @Email
    private String email;

    @NotBlank(message = "Code is mandatory")
    private String code;

    @NotBlank(message = "New password is mandatory")
    private String newPassword;
}
