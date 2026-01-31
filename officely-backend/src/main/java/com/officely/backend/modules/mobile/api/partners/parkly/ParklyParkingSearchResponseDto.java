package com.officely.backend.modules.mobile.api.partners.parkly;

import lombok.Getter;
import lombok.Setter;
import org.springframework.hateoas.RepresentationModel;

import java.util.List;

@Getter
@Setter
public class ParklyParkingSearchResponseDto extends RepresentationModel<ParklyParkingSearchResponseDto> {
    private List<ParklyParkingDto> results;
}
