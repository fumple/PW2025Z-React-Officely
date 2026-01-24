package com.officely.backend.modules.flatly.api.bookings.dto;

import com.officely.backend.entity.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class PaymentDto {
    private String accountNumber;
    private String receiverName;
    private String transferTitle;
    private Instant dueDate;
    private PaymentStatus status;
}
