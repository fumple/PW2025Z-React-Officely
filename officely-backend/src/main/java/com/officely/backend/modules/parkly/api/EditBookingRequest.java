package com.officely.backend.modules.parkly.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class EditBookingRequest {
    private String start;
    private String end;
    private String email;
    @JsonProperty("is_confirmed")
    private Boolean confirmed;
}