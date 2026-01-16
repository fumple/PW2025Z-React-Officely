package com.officely.backend.api.bookings.mapper;

import com.officely.backend.api.bookings.dto.PaymentDto;
import com.officely.backend.entity.PaymentEntity;

public class PaymentMapper {

    public static PaymentDto toDto(PaymentEntity entity){
        if (entity == null) return null;

        PaymentDto dto = new PaymentDto();
        dto.setAccountNumber(entity.getAccountNumber());
        dto.setReceiverName(entity.getReceiverName());
        dto.setTransferTitle(entity.getTransferTitle());
        dto.setDueDate(entity.getDueDate());
        dto.setStatus(entity.getStatus());

        return dto;
    }
}
