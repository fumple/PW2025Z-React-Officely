package com.officely.backend.api.offices.mapper;

import com.officely.backend.api.offices.dto.OfficeOfferWithoutPriceDto;
import com.officely.backend.entity.OfficeOfferEntity;

import java.util.List;
import java.util.Map;

public final class OfficeOfferWithoutPriceMapper {

    public static OfficeOfferWithoutPriceDto toDto(OfficeOfferEntity entity) {
        OfficeOfferWithoutPriceDto dto = new OfficeOfferWithoutPriceDto();

        String officeId = entity.getOffice().getId().toString();
        String offerId = entity.getId().toString();

        dto.setId(offerId);
        dto.setName(entity.getName());
        dto.setFreeCancellationHours(entity.getFreeCancellationHours());
        dto.setPaymentHours(entity.getPaymentHours());
        dto.setPhotoUrls(List.of());
        dto.setProperties(Map.of());

        OfficeOfferWithoutPriceDto.Links links = new OfficeOfferWithoutPriceDto.Links();
        links.setSelf("/offices/" + officeId + "/offers/" + offerId + "/book");
        dto.setLinks(links);
        return dto;
    }
}
