package com.officely.backend.modules.parkly.api;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class EditBookingRequest {
    private String start;
    private String end;
    private String email;
    private Boolean confirmed;
    private Boolean is_confirmed;
}