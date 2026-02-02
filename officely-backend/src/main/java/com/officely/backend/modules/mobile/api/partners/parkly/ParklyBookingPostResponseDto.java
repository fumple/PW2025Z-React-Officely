package com.officely.backend.modules.mobile.api.partners.parkly;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
public class ParklyBookingPostResponseDto {
    private UUID id;
    private String localId;
    private LocalDateTime start;
    private LocalDateTime end;
    private Double totalCost;
    private String status;
    private Boolean disabled;
    private Boolean ev;
    private Boolean big;
}
