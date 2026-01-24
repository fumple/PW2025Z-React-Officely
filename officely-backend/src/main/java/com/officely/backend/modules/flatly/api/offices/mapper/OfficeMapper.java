package com.officely.backend.modules.flatly.api.offices.mapper;

import com.officely.backend.api.PhotosToStringsMapper;
import com.officely.backend.modules.flatly.api.offices.dto.CoordinatesDto;
import com.officely.backend.modules.flatly.api.offices.dto.OfficeDto;
import com.officely.backend.entity.OfficeEntity;
import com.officely.backend.modules.flatly.api.offices.dto.OfficeSearchQueryDetailsDto;
import com.officely.backend.modules.flatly.api.offices.dto.OfficeSearchResultDto;
import com.officely.backend.service.OfficeService;

import java.util.List;

public class OfficeMapper {
    public static OfficeDto toDto(OfficeEntity entity){
        List<String> photoUrls = PhotosToStringsMapper.mapOfficePhotos(entity.getPhotos());

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
        return dto;
    }

    public static OfficeSearchResultDto toDto(OfficeService.OfficeWithDistance entity) {
        var officeDto = toDto(entity.getOffice());
        var dto = new OfficeSearchResultDto();
        var query = new OfficeSearchQueryDetailsDto();
        query.setDistance((int) Math.round(entity.getDistanceMeters()));
        query.setMinPrice(entity.getMinPrice());
        dto.setOffice(officeDto);
        dto.setQuery(query);
        return dto;
    }
}
