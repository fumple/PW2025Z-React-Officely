package com.officely.backend.modules.admin.api.users;

import com.officely.backend.entity.UserEntity;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface AdminUserMapper {
    UserDto userToUserDto(UserEntity entity);
}
