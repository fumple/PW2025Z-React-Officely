package com.officely.backend.api.bookings.mapper;

import com.officely.backend.api.bookings.dto.PaymentDto;
import com.officely.backend.api.bookings.dto.BookingDto;
import com.officely.backend.entity.BookingEntity;
import com.officely.backend.entity.OfficeOfferEntity;

import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;

public class BookingMapper {

    public static BookingDto toDto(BookingEntity entity){
        BookingDto dto = new BookingDto();

        String userId = entity.getUser().getId().toString();
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

        BookingDto.Links links = new BookingDto.Links();
        links.setSelf("/users/" + userId + "/bookings/" + bookingId);
        links.setOffice("/offices/" + officeId);
        links.setItem("/offices/" + officeId + "/items/" + itemId);
        links.setOffer("/offices/" + officeId + "/offers/" + offerId);

        OfficeOfferEntity offer = entity.getOffer();
        Instant startDate = entity.getStartDate().atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant freeCancelDeadline = startDate.minus(Duration.ofHours(offer.getFreeCancellationHours()));
        Instant now = Instant.now();

        if (now.isBefore(freeCancelDeadline)) {
            links.setCancel("/users/" + userId + "/bookings/" + bookingId + "/cancel");
        }

        dto.setLinks(links);
        return dto;
    }
}
