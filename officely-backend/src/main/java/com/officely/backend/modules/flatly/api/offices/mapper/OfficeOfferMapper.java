package com.officely.backend.modules.flatly.api.offices.mapper;

import com.officely.backend.modules.flatly.api.offices.dto.OfficeOfferDto;
import com.officely.backend.entity.OfficeOfferEntity;

import java.util.List;
import java.util.Map;

public class OfficeOfferMapper {
    public static OfficeOfferDto toDto(OfficeOfferEntity entity, int totalPrice) {
        OfficeOfferDto dto = new OfficeOfferDto();
        dto.setId(String.valueOf(entity.getId()));
        dto.setName(entity.getName());

        dto.setTotalPrice(totalPrice);

        dto.setFreeCancellationHours(entity.getFreeCancellationHours());
        dto.setPaymentHours(entity.getPaymentHours());

        dto.setPhotoUrls(List.of());
        dto.setProperties(Map.of());
        return dto;
    }
}
