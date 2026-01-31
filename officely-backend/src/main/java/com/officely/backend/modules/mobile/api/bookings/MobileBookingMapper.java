package com.officely.backend.modules.mobile.api.bookings;

import com.officely.backend.entity.BookingEntity;
import org.springframework.stereotype.Component;

@Component
public class MobileBookingMapper {
    public MobileBookingDto toDto(BookingEntity e) {
        var dto = new MobileBookingDto();
        dto.setId(e.getId());
        dto.setOfficeName(e.getOffice().getName());
        dto.setStartDate(e.getStartDate().toString());
        dto.setEndDate(e.getEndDate().toString());
        dto.setTotalPrice(e.getTotalPrice());
        dto.setStatus(e.getBookingStatus().name());
        dto.setPaymentStatus(e.getPaymentInfo() != null ? e.getPaymentInfo().getStatus().name() : null);
        return dto;
    }
}
