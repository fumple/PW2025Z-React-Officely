package com.officely.backend.modules.mobile.api.users;

import com.officely.backend.entity.UserEntity;
import org.mapstruct.*;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface MobileUserMapper {
    MobileUserDto userToDto(UserEntity entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void patch(MobileUserPatchRequest request, @MappingTarget UserEntity updated);
}
