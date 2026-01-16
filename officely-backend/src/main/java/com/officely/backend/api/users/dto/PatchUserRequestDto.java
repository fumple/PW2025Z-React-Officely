package com.officely.backend.api.users.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PatchUserRequestDto {
    private String firstName;
    private String lastName;
    private String nationality;
    private String phoneNumber;
}
