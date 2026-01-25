package com.officely.backend.api.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import org.hibernate.validator.constraints.Length;

@Getter
public class ResetPasswordRequest {
    @NotBlank(message = "Email is mandatory")
    @Email
    @Length(max = 256)
    private String email;

    @NotBlank(message = "Code is mandatory")
    @Length(max = 6)
    private String code;

    @NotBlank(message = "New password is mandatory")
    @Length(min = 8, max = 64)
    private String newPassword;
}
