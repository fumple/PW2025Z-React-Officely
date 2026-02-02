package com.officely.backend.modules.mobile.api.partners.parkly;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ParklyBookingPatchRequest {
    private LocalDate start;
    private LocalDate end;
    private Boolean confirmed;
}
