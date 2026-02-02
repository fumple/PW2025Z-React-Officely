package com.officely.backend.modules.mobile.api.bookings.mapper;

import com.officely.backend.entity.BookingEntity;
import com.officely.backend.modules.mobile.api.bookings.dto.MobileBookingDto;
import com.officely.backend.modules.flatly.api.bookings.mapper.PaymentMapper;

public class MobileBookingMapper {

    public static MobileBookingDto toDto(BookingEntity entity) {
        if (entity == null) return null;

        MobileBookingDto dto = new MobileBookingDto();

        dto.setId(entity.getId().toString());
        dto.setOfficeId(entity.getOffice().getId().toString());
        dto.setOfferId(entity.getOffer().getId().toString());
        dto.setItemId(entity.getItem().getId().toString());

        dto.setStatus(entity.getBookingStatus());

        dto.setStartDate(entity.getStartDate());
        dto.setEndDate(entity.getEndDate());
        dto.setCreationDate(entity.getCreationDate());
        dto.setTotalPrice(entity.getTotalPrice());
        dto.setPaymentInfo(PaymentMapper.toDto(entity.getPaymentInfo()));

        return dto;
    }
}
