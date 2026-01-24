package com.officely.backend.modules.flatly.api.offices.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.hateoas.RepresentationModel;

import java.util.List;
import java.util.Map;

@Setter
@Getter
public class OfficeOfferDto extends RepresentationModel<OfficeOfferDto> {
    private String id;
    private String name;
    private int totalPrice;
    private int freeCancellationHours;
    private int paymentHours;
    private List<String> photoUrls;
    private Map<String, String> properties;
}