package com.officely.backend.modules.admin.api.bookings;

import lombok.Getter;
import lombok.Setter;
import org.springframework.hateoas.RepresentationModel;

import java.time.Instant;
import java.time.LocalDate;

@Getter
@Setter
public class BookingDto extends RepresentationModel<BookingDto> {
    @Getter
    @Setter
    public static class PaymentInfo {
        private String status;
        private String accountNumber;
        private String receiverName;
        private String transferTitle;
        private Instant dueDate;
    }

    private String id;
    private String userId;
    private String officeId;
    private String itemId;
    private String offerId;
    private String status;
    private Instant creationDate;
    private LocalDate startDate;
    private LocalDate endDate;
    private String cancellationReason;
    private int totalPrice;
    private PaymentInfo paymentInfo;
}
