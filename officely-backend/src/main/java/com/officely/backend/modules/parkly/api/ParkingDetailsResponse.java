package com.officely.backend.modules.parkly.api;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter @Setter
public class ParkingDetailsResponse {
    private String id;
    private String name;
    private String country;
    private String city;
    private String postalCode;
    private String streetName;
    private String streetNumber;
    private Double latitude;
    private Double longitude;
    private Double priceForPeriod;
    private List<String> imageUrls;
    private Boolean disabled;
    private Boolean ev;
    private Boolean big;
}