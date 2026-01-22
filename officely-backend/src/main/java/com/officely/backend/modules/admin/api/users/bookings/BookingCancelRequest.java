package com.officely.backend.modules.admin.api.users.bookings;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BookingCancelRequest {
    private boolean withRefund;
    @NotBlank
    private String reason;
}
