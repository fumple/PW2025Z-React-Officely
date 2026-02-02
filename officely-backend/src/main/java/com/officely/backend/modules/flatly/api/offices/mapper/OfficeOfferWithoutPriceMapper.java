package com.officely.backend.modules.flatly.api.offices.mapper;

import com.officely.backend.entity.OfficeOfferEntity;
import com.officely.backend.modules.flatly.api.offices.dto.OfficeOfferWithoutPriceDto;

public final class OfficeOfferWithoutPriceMapper {

    public static OfficeOfferWithoutPriceDto toDto(OfficeOfferEntity entity) {
        OfficeOfferWithoutPriceDto dto = new OfficeOfferWithoutPriceDto();

        String offerId = entity.getId().toString();

        dto.setId(offerId);
        dto.setName(entity.getPublicName() != null ? entity.getPublicName() : entity.getName());
        dto.setFreeCancellationHours(entity.getFreeCancellationHours());
        dto.setPaymentHours(entity.getPaymentHours());
        dto.setProperties(entity.getProperties());
        return dto;
    }
}
