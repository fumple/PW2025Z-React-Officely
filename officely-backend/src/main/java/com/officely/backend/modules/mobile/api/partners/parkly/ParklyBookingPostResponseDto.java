package com.officely.backend.modules.mobile.api.partners.parkly;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ParklyBookingPostResponseDto {
    private String localId;
    private String start;
    private String end;
    private Double totalCost;
    private String status;
    private Boolean disabled;
    private Boolean ev;
    private Boolean big;
}
