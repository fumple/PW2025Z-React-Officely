package com.officely.backend.modules.mobile.api.partners.parkly;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
public class ParklyBookingResourceDto {
    private UUID id;
    private String spotId;

    private String parkingName;
    private String street;
    private String city;
    private String imageUrl;

    private String localId;
    private LocalDateTime start;
    private LocalDateTime end;

    private Double totalCost;
    private String status;
    private String source;

    private Boolean disabled;
    private Boolean ev;
    private Boolean big;
}