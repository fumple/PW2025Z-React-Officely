package com.officely.backend.modules.admin.api.officemembers;

import lombok.Getter;
import lombok.Setter;
import org.springframework.hateoas.RepresentationModel;

@Getter
@Setter
public class OfficeMemberDto extends RepresentationModel<OfficeMemberDto> {
    private String id;
    private String officeId;
    private String userId;
}
