package com.officely.backend.api.offices.mapper;

import com.officely.backend.api.offices.dto.OfficeOfferDto;
import com.officely.backend.entity.OfficeOfferEntity;

import java.util.List;
import java.util.Map;

public class OfficeOfferMapper {
    public static OfficeOfferDto toDto(OfficeOfferEntity entity, Long days, Long officeId) {
        OfficeOfferDto dto = new OfficeOfferDto();
        dto.setId(String.valueOf(entity.getId()));
        dto.setName(entity.getName());

        int totalPrice = Math.toIntExact(days * (long) entity.getPricePerDay());
        dto.setTotalPrice(totalPrice);

        dto.setFreeCancellationHours(entity.getFreeCancellationHours());
        dto.setPaymentHours(entity.getPaymentHours());

        dto.setPhotoUrls(List.of());
        dto.setProperties(Map.of());

        OfficeOfferDto.Links links = new OfficeOfferDto.Links();
        links.setAccept("/offices/" + officeId.toString() + "/offers/" + dto.getId() + "/book");
        dto.setLinks(links);

        return dto;
    }
}
