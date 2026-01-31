package com.officely.backend.modules.parkly.api;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class ParkingResponse {
    private String id;
    private String name;
    private String city;
    private String streetName;
    private String streetNumber;
    private Double latitude;
    private Double longitude;
    private Double priceForPeriod;
    private String mainImageUrl;
}