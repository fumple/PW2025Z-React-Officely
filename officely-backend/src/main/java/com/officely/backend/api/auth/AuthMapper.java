package com.officely.backend.api.auth;

import com.officely.backend.entity.UserEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface AuthMapper {
    @Mapping(ignore = true, target = "type")
    UserEntity signUpRequestToUser(SignUpRequest request);
}
