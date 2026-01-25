package com.officely.backend.api.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import org.hibernate.validator.constraints.Length;

@Getter
public class ResetPasswordEmailRequest {
    @NotBlank(message = "Email is mandatory")
    @Email
    @Length(max = 256)
    private String email;
}
