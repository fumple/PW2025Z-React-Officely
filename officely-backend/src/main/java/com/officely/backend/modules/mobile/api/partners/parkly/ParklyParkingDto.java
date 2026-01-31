package com.officely.backend.modules.mobile.api.partners.parkly;

import lombok.Getter;
import lombok.Setter;
import org.springframework.hateoas.RepresentationModel;

@Getter
@Setter
public class ParklyParkingDto extends RepresentationModel<ParklyParkingDto> {
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
