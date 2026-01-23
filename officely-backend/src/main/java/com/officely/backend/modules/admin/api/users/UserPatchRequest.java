package com.officely.backend.modules.admin.api.users;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserPatchRequest {
    private String firstName;
    private String lastName;

    @Email
    private String email;
    @Size(min = 8, max = 64)
    private String password;
    private String currentPassword;

    @Pattern(regexp = "^[A-Z]{2}$")
    private String nationality;
    @Pattern(regexp = "^\\+[1-9]\\d{1,14}$")
    private String phoneNumber;

    private boolean isBlocked;
}
