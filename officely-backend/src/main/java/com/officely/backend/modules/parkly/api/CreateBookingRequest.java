package com.officely.backend.modules.parkly.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class CreateBookingRequest {
    private String start;
    private String end;
    private String source; // "officely"
    private String email;

    @JsonProperty("parking_id")
    private String parkingId;

    private Boolean disabled;
    private Boolean ev;
    private Boolean big;

    private Boolean is_ev;
    private Boolean is_disabled;
    private Boolean is_big;
}