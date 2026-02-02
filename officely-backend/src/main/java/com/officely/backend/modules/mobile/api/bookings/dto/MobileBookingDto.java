package com.officely.backend.modules.mobile.api.bookings.dto;

import com.officely.backend.entity.BookingStatus;
import com.officely.backend.modules.flatly.api.bookings.dto.PaymentDto;
import lombok.Getter;
import lombok.Setter;
import org.springframework.hateoas.RepresentationModel;

import java.time.Instant;
import java.time.LocalDate;

@Getter
@Setter
public class MobileBookingDto extends RepresentationModel<MobileBookingDto> {
    private String id;
    private String officeId;
    private String itemId;
    private String offerId;
    private BookingStatus status;
    private Instant creationDate;
    private LocalDate startDate;
    private LocalDate endDate;
    private String cancellationReason;
    private Integer totalPrice;
    private PaymentDto paymentInfo;
}