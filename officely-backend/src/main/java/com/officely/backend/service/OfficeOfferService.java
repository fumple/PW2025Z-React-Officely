package com.officely.backend.service;

import com.officely.backend.entity.OfficeOfferEntity;
import com.officely.backend.repository.OfficeOfferRepository;
import jakarta.annotation.Nullable;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class OfficeOfferService {
    private final OfficeOfferRepository officeOfferRepository;

    public OfficeOfferEntity getOffer(Long officeId, Long offerId){
        return officeOfferRepository.findByIdAndOfficeId(offerId, officeId)
                .orElseThrow(() -> new NoSuchElementException("The given office or offer was not found"));
    }

    public Page<OfficeOfferEntity> getOffers(Long officeId, PageRequest pageRequest) {
        return officeOfferRepository.getByOfficeId(officeId, pageRequest);
    }
    public Page<OfficeOfferEntity> getOffers(Long officeId, PageRequest pageRequest, String search) {
        try {
            var id = Long.parseLong(search);
            return officeOfferRepository.getByOfficeIdAndIdOrNameContainingIgnoreCaseOrPublicNameContainingIgnoreCase(officeId, id, search, search, pageRequest);
        } catch (Exception ex) {
            return officeOfferRepository.getByOfficeIdAndNameContainingIgnoreCaseOrPublicNameContainingIgnoreCase(officeId, search, search, pageRequest);
        }
    }

    public OfficeOfferEntity createOffer(OfficeOfferEntity entity, @Nullable String sourceId){
        // TODO: Implement sourceId
        return officeOfferRepository.save(entity);
    }
}
