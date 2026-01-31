package com.officely.backend.modules.mobile.api.partners.parkly;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ParklyBookingPatchRequest {
    private String start;
    private String end;
    private Boolean confirmed;
}
