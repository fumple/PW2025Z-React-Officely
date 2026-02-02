package com.officely.backend.modules.parkly.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter @Setter
public class EditBookingRequest {
    private LocalDateTime start;
    private LocalDateTime end;
    private String email;
    @JsonProperty("is_confirmed")
    private boolean confirmed;
}