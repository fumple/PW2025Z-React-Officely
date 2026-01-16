package com.officely.backend.flatly.api.users.mapper;

import com.officely.backend.flatly.api.users.dto.CreateUserRequestDto;
import com.officely.backend.flatly.api.users.dto.PatchUserRequestDto;
import com.officely.backend.flatly.api.users.dto.UserDto;
import com.officely.backend.entity.UserEntity;
import org.mapstruct.*;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper {
    UserEntity createRequestToUser(CreateUserRequestDto request);
    UserDto userToDto(UserEntity user);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void update(PatchUserRequestDto request, @MappingTarget UserEntity updated);
}
