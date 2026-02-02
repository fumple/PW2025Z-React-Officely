package com.officely.backend.modules.parkly.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import java.util.List;
import java.util.UUID;

@Getter @Setter
public class ParkingDetailsResponse {
    private UUID id;
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
    @JsonProperty("is_disabled")
    private Boolean disabled;
    @JsonProperty("is_ev")
    private Boolean ev;
    @JsonProperty("is_big")
    private Boolean big;
}