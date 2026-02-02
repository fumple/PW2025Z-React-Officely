package com.officely.backend.modules.mobile.api.partners.parkly;

import lombok.Getter;
import lombok.Setter;
import org.springframework.hateoas.RepresentationModel;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class ParklyParkingDetailsDto extends RepresentationModel<ParklyParkingDetailsDto> {
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
    private Boolean disabled;
    private Boolean ev;
    private Boolean big;
}
