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

import java.util.Optional;

@Service
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class OfficeOfferService {
    private final OfficeOfferRepository officeOfferRepository;
    private final OfficeItemService officeItemService;
    private final FiltersService filtersService;

    public Optional<OfficeOfferEntity> getOffer(Long officeId, Long offerId) {
        return officeOfferRepository.findByIdAndOfficeId(offerId, officeId);
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
        filtersService.validateProperties(entity.getProperties());
        var saved = officeOfferRepository.save(entity);
        if(sourceId != null) {
            var source = officeOfferRepository.findByIdAndOfficeId(sourceId, entity.getOffice().getId())
                    .orElseThrow(() -> new ValidationException("sourceId", "The given source offer was not found"));
            saved.setAvailable(source.isAvailable());
            officeOfferRepository.save(saved);
            source.setAvailable(false);
            officeOfferRepository.save(source);
            officeItemService.moveItemsToNewOffer(source, saved);
        }
        return saved;
    }

    @Transactional
    public OfficeOfferEntity setOfferAvailable(OfficeOfferEntity entity, boolean available) {
        entity.setAvailable(available);
        return officeOfferRepository.save(entity);
    }
}
