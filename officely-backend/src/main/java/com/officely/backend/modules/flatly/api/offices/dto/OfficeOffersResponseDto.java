package com.officely.backend.modules.flatly.api.offices.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.hateoas.RepresentationModel;

import java.util.List;

@Setter
@Getter
public class OfficeOffersResponseDto extends RepresentationModel<OfficeOffersResponseDto> {
    private List<OfficeOfferDto> offers;

}
