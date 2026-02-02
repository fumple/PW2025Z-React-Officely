package com.officely.backend.modules.mobile.api.partners.parkly;

import lombok.Getter;
import lombok.Setter;
import org.springframework.hateoas.RepresentationModel;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
public class ParklyBookingDto extends RepresentationModel<ParklyBookingDto> {
    private UUID id;

    private String parkingName;
    private String street;
    private String city;
    private String imageUrl;

    private LocalDateTime start;
    private LocalDateTime end;
    private Double totalCost;
    private String status;

    private Boolean disabled;
    private Boolean ev;
    private Boolean big;

    private String source; // "officely"

    private String spotId;
    private String localId;
}