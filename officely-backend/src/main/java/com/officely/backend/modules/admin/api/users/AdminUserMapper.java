package com.officely.backend.modules.admin.api.users;

import com.officely.backend.entity.UserEntity;
import org.mapstruct.*;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface AdminUserMapper {
    UserDto userToUserDto(UserEntity entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void update(UserPatchRequest request, @MappingTarget UserEntity updated);
}
