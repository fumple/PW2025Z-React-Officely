package com.officely.backend.service;

import com.officely.backend.modules.flatly.api.offices.dto.OfficeItemDto;
import com.officely.backend.modules.flatly.api.offices.mapper.OfficeItemMapper;
import com.officely.backend.entity.OfficeItemEntity;
import com.officely.backend.repository.OfficeItemRepository;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;

@Service
public class OfficeItemService {
    private final OfficeItemRepository officeItemRepository;

    public OfficeItemService(OfficeItemRepository officeItemRepository){
        this.officeItemRepository = officeItemRepository;
    }

    public OfficeItemDto getOfficeItem(String officeId, String itemId){
        Long officeIdLong = parseId(officeId, "officeId");
        Long itemIdLong = parseId(itemId, "itemId");

        OfficeItemEntity entity = officeItemRepository.findByIdAndOfficeId(itemIdLong, officeIdLong)
                .orElseThrow(() -> new NoSuchElementException("The given office or item was not found"));

        OfficeItemDto dto = OfficeItemMapper.toDto(officeIdLong, entity);
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
