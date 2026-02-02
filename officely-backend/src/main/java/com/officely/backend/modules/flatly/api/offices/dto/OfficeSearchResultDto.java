package com.officely.backend.modules.flatly.api.offices.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.hateoas.RepresentationModel;

@Setter
@Getter
public class OfficeSearchResultDto extends RepresentationModel<OfficeSearchResultDto> {
    private OfficeDto office;
    private OfficeSearchQueryDetailsDto query;
}
