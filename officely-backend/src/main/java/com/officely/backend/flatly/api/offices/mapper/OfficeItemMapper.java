package com.officely.backend.flatly.api.offices.mapper;

import com.officely.backend.flatly.api.offices.dto.OfficeItemDto;
import com.officely.backend.entity.OfficeItemEntity;

public final class OfficeItemMapper {

    private OfficeItemMapper() {}

    public static OfficeItemDto toDto(Long officeId, OfficeItemEntity entity) {
        OfficeItemDto dto = new OfficeItemDto();
        dto.setId(entity.getId().toString());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setFloor(entity.getFloor().toString());
        dto.setRoom(entity.getRoom());

        OfficeItemDto.Links links = new OfficeItemDto.Links();
        links.setSelf("/offices/" + officeId + "/items/" + entity.getId());

        dto.setLinks(links);
        return dto;
    }
}
