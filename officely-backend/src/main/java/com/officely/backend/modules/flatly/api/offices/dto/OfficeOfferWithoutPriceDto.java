package com.officely.backend.modules.flatly.api.offices.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.hateoas.RepresentationModel;

import java.util.List;
import java.util.Map;

@Setter
@Getter
public class OfficeOfferWithoutPriceDto extends RepresentationModel<OfficeOfferWithoutPriceDto> {
    private String id;
    private String name;
    private Integer freeCancellationHours;
    private Integer paymentHours;
    private List<String> photoUrls;
    private Map<String, String> properties;
}