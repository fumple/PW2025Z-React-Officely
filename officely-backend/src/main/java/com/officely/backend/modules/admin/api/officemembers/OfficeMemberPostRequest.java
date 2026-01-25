package com.officely.backend.modules.admin.api.officemembers;

import jakarta.validation.constraints.Email;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.validator.constraints.Length;

@Getter
@Setter
public class OfficeMemberPostRequest {
    @Length(max = 256)
    @Email
    private String email;
}
