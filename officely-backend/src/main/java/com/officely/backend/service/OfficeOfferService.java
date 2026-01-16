package com.officely.backend.service;

import com.officely.backend.flatly.api.offices.dto.OfficeOfferWithoutPriceDto;
import com.officely.backend.flatly.api.offices.mapper.OfficeOfferWithoutPriceMapper;
import com.officely.backend.entity.OfficeOfferEntity;
import com.officely.backend.repository.OfficeOfferRepository;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;

@Service
public class OfficeOfferService {
    private final OfficeOfferRepository officeOfferRepository;

    public OfficeOfferService(OfficeOfferRepository officeOfferRepository){
        this.officeOfferRepository = officeOfferRepository;
    }

    public OfficeOfferWithoutPriceDto getOffer(String officeId, String offerId){
        Long officeIdLong = parseId(officeId, "officeId");
        Long offerIdLong = parseId(offerId, "offerId");

        OfficeOfferEntity entity = officeOfferRepository.findByIdAndOfficeId(offerIdLong, officeIdLong)
                .orElseThrow(() -> new NoSuchElementException("The given office or offer was not found"));

        OfficeOfferWithoutPriceDto dto = OfficeOfferWithoutPriceMapper.toDto(entity);
        return dto;
    }

    private Long parseId(String raw, String fieldName) {
        try {
            return Long.parseLong(raw);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid " + fieldName);
        }
    }
}
