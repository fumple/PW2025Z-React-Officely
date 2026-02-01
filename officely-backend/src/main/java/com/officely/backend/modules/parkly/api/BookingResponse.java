package com.officely.backend.modules.parkly.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class BookingResponse {
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

    @JsonProperty("is_disabled")
    private Boolean disabled;
    @JsonProperty("is_ev")
    private Boolean ev;
    @JsonProperty("is_big")
    private Boolean big;
}