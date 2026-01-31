package com.officely.backend.modules.mobile.api.partners.parkly;

import lombok.Getter;
import lombok.Setter;
import org.springframework.hateoas.RepresentationModel;

@Getter
@Setter
public class ParklyBookingDto extends RepresentationModel<ParklyBookingDto> {
    private String id;

    private String parkingName;
    private String street;
    private String city;
    private String imageUrl;

    private String start;
    private String end;
    private Double totalCost;
    private String status;

    private Boolean disabled;
    private Boolean ev;
    private Boolean big;

    private String source; // "officely"

    private String userId;
    private String spotId;
    private String localId;
}