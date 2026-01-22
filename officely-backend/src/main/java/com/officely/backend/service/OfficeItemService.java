package com.officely.backend.service;

import com.officely.backend.entity.OfficeItemEntity;
import com.officely.backend.repository.OfficeItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class OfficeItemService {
    private final OfficeItemRepository officeItemRepository;

    public OfficeItemEntity getOfficeItem(Long officeId, Long itemId){
        return officeItemRepository.findByIdAndOfficeId(itemId, officeId)
                .orElseThrow(() -> new NoSuchElementException("The given office or item was not found"));
    }

    public Page<OfficeItemEntity> getItems(Long officeId, PageRequest pageRequest) {
        return officeItemRepository.getByOfficeId(officeId, pageRequest);
    }
    public Page<OfficeItemEntity> getItems(Long officeId, PageRequest pageRequest, String search) {
        try {
            var id = Long.parseLong(search);
            return officeItemRepository.getByOfficeIdAndIdOrNameContainingIgnoreCase(officeId, id, search, pageRequest);
        } catch (Exception ex) {
            return officeItemRepository.getByOfficeIdAndNameContainingIgnoreCase(officeId, search, pageRequest);
        }
    }

    public OfficeItemEntity createOfficeItem(OfficeItemEntity entity){
        if(entity.getType() != OfficeItemEntity.Types.SHARED) {
            entity.setCapacity(1);
        }
        return officeItemRepository.save(entity);
    }

    public OfficeItemEntity patchOfficeItem(OfficeItemEntity entity) {
        if(entity.getType() != OfficeItemEntity.Types.SHARED) {
            entity.setCapacity(1);
        }
        return officeItemRepository.save(entity);
    }
}
