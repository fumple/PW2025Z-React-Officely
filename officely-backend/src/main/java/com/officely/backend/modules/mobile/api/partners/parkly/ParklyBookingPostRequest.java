package com.officely.backend.modules.mobile.api.partners.parkly;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ParklyBookingPostRequest {

    @NotBlank
    private String parkingId;

    @NotBlank
    private LocalDate startDate;

    @NotBlank
    private LocalDate endDate;

    private Boolean disabled;
    private Boolean ev;
    private Boolean big;
}