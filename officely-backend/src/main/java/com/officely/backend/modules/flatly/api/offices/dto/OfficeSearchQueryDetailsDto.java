package com.officely.backend.modules.flatly.api.offices.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class OfficeSearchQueryDetailsDto {
    private int minPrice;
    private int distance;
}
