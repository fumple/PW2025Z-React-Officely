package com.officely.backend.api;

import com.officely.backend.entity.OfficeEntity;
import com.officely.backend.entity.OfficePhotoEntity;

import java.util.List;

public class OfficeMapper {
    public static Office toDto(OfficeEntity entity){
        List<String> photoUrls = entity.getPhotos().stream().map(OfficePhotoEntity::getUrl).toList();

        Office dto = new Office();
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setAddress(entity.getAddress());
        dto.setMinPrice(entity.getMinPrice());
        dto.setMaxPrice(entity.getMaxPrice());
        dto.setLongitude(entity.getLongitude());
        dto.setLatitude(entity.getLatitude());
        dto.setPhotoUrls(photoUrls);
        dto.setWorkspaceType(entity.getWorkspaceType());
        dto.setWifi(entity.getWifi());
        dto.setAccess24h(entity.getAccess24h());
        dto.setKitchen(entity.getKitchen());
        dto.setParking(entity.getParking());
        dto.setWheelchairAccessible(entity.getWheelchairAccessible());
        dto.setQuiet(entity.getQuiet());
        dto.setSocial(entity.getSocial());
        dto.setMonitor(entity.getMonitor());
        dto.setPrinter(entity.getPrinter());

        return dto;
    }
}
