package com.officely.backend.modules.flatly.api.offices.mapper;

import com.officely.backend.modules.flatly.api.offices.dto.CoordinatesDto;
import com.officely.backend.modules.flatly.api.offices.dto.OfficeDto;
import com.officely.backend.entity.OfficeEntity;
import com.officely.backend.entity.OfficePhotoEntity;

import java.util.List;

public class OfficeMapper {
    public static OfficeDto toDto(OfficeEntity entity){
        List<String> photoUrls = entity.getPhotos().stream().map(OfficePhotoEntity::getUrl).toList();

        OfficeDto dto = new OfficeDto();
        dto.setId(String.valueOf(entity.getId()));
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setAddress(entity.getAddress());

        CoordinatesDto coordinates = new CoordinatesDto();
        coordinates.setLat(entity.getLatitude());
        coordinates.setLon(entity.getLongitude());
        dto.setCoordinates(coordinates);

        dto.setContactEmail(entity.getContactEmail());
        dto.setContactPhone(entity.getContactPhone());
        dto.setPhotoUrls(photoUrls);

        OfficeDto.Links links = new OfficeDto.Links();
        links.setSelf("/offices/" + entity.getId());
        dto.setLinks(links);

        return dto;
    }
}
