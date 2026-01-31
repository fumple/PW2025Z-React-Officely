package com.officely.backend.modules.mobile.api.partners.parkly;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ParklyBookingPostRequest {

    @NotBlank
    private String parkingId;

    @NotBlank
    private String startDate;

    @NotBlank
    private String endDate;

    private Boolean disabled;
    private Boolean ev;
    private Boolean big;
}