package com.officely.backend.service;

import com.officely.backend.api.throwables.ValidationException;
import com.officely.backend.entity.OfficeOfferEntity;
import com.officely.backend.repository.OfficeOfferRepository;
import jakarta.annotation.Nullable;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class OfficeOfferService {
    private final OfficeOfferRepository officeOfferRepository;
    private final OfficeItemService officeItemService;

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

    @Transactional
    public OfficeOfferEntity createOffer(OfficeOfferEntity entity, @Nullable Long sourceId){
        var saved = officeOfferRepository.save(entity);
        if(sourceId != null) {
            officeOfferRepository.findByIdAndOfficeId(sourceId, entity.getOffice().getId())
                    .orElseThrow(() -> new ValidationException("", "The given source offer was not found"));
            officeItemService.moveItemsToNewOffer(sourceId, saved.getId());
        }
        return saved;
    }
}
