package com.officely.backend.modules.admin.api.officemembers;

import com.officely.backend.entity.OfficeMemberEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE)
public abstract class AdminOfficeMemberMapper {
    @Mapping(source = "office.id", target = "officeId")
    @Mapping(source = "user.id", target = "userId")
    public abstract OfficeMemberDto officeMemberToOfficeMemberDto(OfficeMemberEntity entity);
}
