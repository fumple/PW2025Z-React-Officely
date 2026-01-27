package com.officely.backend.modules.mobile.api.users;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.validator.constraints.Length;

@Getter
@Setter
public class MobileUserPatchRequest {
    @Length(max = 32)
    private String firstName;
    @Length(max = 32)
    private String lastName;

    @Email
    @Length(max = 256)
    private String email;
    @Length(min = 8, max = 64)
    private String password;
    @Length(min = 8, max = 64)
    private String currentPassword;

    @Pattern(regexp = "^[A-Z]{2}$")
    private String nationality;
    @Pattern(regexp = "^\\+[1-9]\\d{1,14}$")
    private String phoneNumber;

    private boolean blocked;
}
