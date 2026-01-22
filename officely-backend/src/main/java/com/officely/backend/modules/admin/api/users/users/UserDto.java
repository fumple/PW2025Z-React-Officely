package com.officely.backend.modules.admin.api.users.users;

import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;
import org.springframework.hateoas.RepresentationModel;

import java.time.LocalDate;

@Setter
@Getter
public class UserDto extends RepresentationModel<UserDto> {
    private String type;
    private String id;
    private String firstName;
    private String lastName;
    private String email;

    private LocalDate dateOfBirth;

    @Pattern(regexp = "^[A-Z]{2}$")
    private String nationality;

    @Pattern(regexp = "^\\+[1-9]\\d{1,14}$")
    private String phoneNumber;

    private boolean isBlocked;
    private boolean isAdmin;
}
