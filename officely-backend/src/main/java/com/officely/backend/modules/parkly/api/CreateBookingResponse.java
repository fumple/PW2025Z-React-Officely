package com.officely.backend.modules.parkly.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter
public class CreateBookingResponse {
    private UUID id;
    private String localId;
    private LocalDateTime start;
    private LocalDateTime end;
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
