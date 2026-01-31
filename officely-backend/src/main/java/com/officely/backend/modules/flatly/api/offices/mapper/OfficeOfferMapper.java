package com.officely.backend.modules.flatly.api.offices.mapper;

import com.officely.backend.entity.OfficeOfferEntity;
import com.officely.backend.modules.flatly.api.offices.dto.OfficeOfferDto;

public class OfficeOfferMapper {
    public static OfficeOfferDto toDto(OfficeOfferEntity entity, int totalPrice) {
        OfficeOfferDto dto = new OfficeOfferDto();
        dto.setId(String.valueOf(entity.getId()));
        dto.setName(entity.getPublicName() != null ? entity.getPublicName() : entity.getName());

        dto.setTotalPrice(totalPrice);

        dto.setFreeCancellationHours(entity.getFreeCancellationHours());
        dto.setPaymentHours(entity.getPaymentHours());

        dto.setProperties(entity.getProperties());
        return dto;
    }
}
