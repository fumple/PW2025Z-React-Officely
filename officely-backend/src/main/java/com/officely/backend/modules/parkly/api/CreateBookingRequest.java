package com.officely.backend.modules.parkly.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter @Setter
public class CreateBookingRequest {
    private LocalDateTime start;
    private LocalDateTime end;
    private String source; // "OFFICELY"
    private String email;
    private String name;
    private String surname;
    private String phoneNumber;

    @JsonProperty("parking_id")
    private String parkingId;

    @JsonProperty("is_disabled")
    private Boolean disabled;
    @JsonProperty("is_ev")
    private Boolean ev;
    @JsonProperty("is_big")
    private Boolean big;
}