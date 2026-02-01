package com.officely.backend.modules.mobile.api.partners.parkly;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ParklyBookingResourceDto {
    private String id;
    private String spotId;

    private String parkingName;
    private String street;
    private String city;
    private String imageUrl;

    private String localId;
    private String start;
    private String end;

    private Double totalCost;
    private String status;
    private String source;

    private Boolean disabled;
    private Boolean ev;
    private Boolean big;
}