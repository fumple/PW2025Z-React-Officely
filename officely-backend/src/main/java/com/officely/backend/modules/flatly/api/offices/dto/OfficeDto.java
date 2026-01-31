package com.officely.backend.modules.flatly.api.offices.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.hateoas.RepresentationModel;

import java.util.List;

@Setter
@Getter
public class OfficeDto extends RepresentationModel<OfficeDto> {
    private String id;
    private String name;
    public String description;
    public String openingHours;
    private String address;

    private List<String> photoUrls;
    private String contactEmail;
    private String contactPhone;

    private CoordinatesDto coordinates;
}


