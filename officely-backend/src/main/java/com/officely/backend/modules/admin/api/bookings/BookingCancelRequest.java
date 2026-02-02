package com.officely.backend.modules.admin.api.bookings;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.validator.constraints.Length;

@Getter
@Setter
public class BookingCancelRequest {
    private boolean withRefund;

    @NotBlank
    @Length(max = 64)
    private String reason;
}
