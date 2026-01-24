package com.officely.backend.modules.flatly.api.offices.mapper;

import com.officely.backend.modules.flatly.api.offices.dto.OfficeItemDto;
import com.officely.backend.entity.OfficeItemEntity;

public final class OfficeItemMapper {

    private OfficeItemMapper() {}

    public static OfficeItemDto toDto(OfficeItemEntity entity) {
        OfficeItemDto dto = new OfficeItemDto();
        dto.setId(entity.getId().toString());
        dto.setName(entity.getName());
        dto.setFloor(entity.getFloor().toString());
        dto.setRoom(entity.getRoom());
        return dto;
    }
}
