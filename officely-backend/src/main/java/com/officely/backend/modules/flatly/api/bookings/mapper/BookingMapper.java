package com.officely.backend.modules.flatly.api.bookings.mapper;

import com.officely.backend.entity.BookingEntity;
import com.officely.backend.modules.flatly.api.bookings.dto.BookingDto;
import com.officely.backend.modules.flatly.api.bookings.dto.PaymentDto;

public class BookingMapper {

    public static BookingDto toDto(BookingEntity entity){
        BookingDto dto = new BookingDto();

        String bookingId = entity.getId().toString();
        String officeId = entity.getOffice().getId().toString();
        String offerId = entity.getOffer().getId().toString();
        String itemId = entity.getItem().getId().toString();

        dto.setId(bookingId);
        dto.setOfficeId(officeId);
        dto.setOfferId(offerId);
        dto.setItemId(itemId);
        dto.setStatus(entity.getBookingStatus());
        dto.setStartDate(entity.getStartDate());
        dto.setEndDate(entity.getEndDate());
        dto.setCreationDate(entity.getCreationDate());
        dto.setTotalPrice(entity.getTotalPrice());

        if (entity.getPaymentInfo() != null) {
            dto.setPaymentInfo(new PaymentDto(
                    entity.getPaymentInfo().getAccountNumber(),
                    entity.getPaymentInfo().getReceiverName(),
                    entity.getPaymentInfo().getTransferTitle(),
                    entity.getPaymentInfo().getDueDate(),
                    entity.getPaymentInfo().getStatus()
            ));
        }
        return dto;
    }
}
