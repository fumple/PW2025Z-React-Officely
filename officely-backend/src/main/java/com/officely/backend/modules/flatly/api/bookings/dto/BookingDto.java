package com.officely.backend.modules.flatly.api.bookings.dto;

import com.officely.backend.entity.BookingStatus;
import lombok.Getter;
import lombok.Setter;
import org.springframework.hateoas.RepresentationModel;

import java.time.Instant;
import java.time.LocalDate;

@Setter
@Getter
public class BookingDto extends RepresentationModel<BookingDto> {
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
