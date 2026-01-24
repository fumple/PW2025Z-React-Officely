package com.officely.backend.modules.flatly.api.users.dto;

import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PatchUserRequestDto {
    private String firstName;
    private String lastName;
    @Pattern(regexp = "^[A-Z]{2}$")
    private String nationality;
    @Pattern(regexp = "^\\+[1-9]\\d{1,14}$")
    private String phoneNumber;
}
