package com.officely.backend.api.filters;

import lombok.Getter;
import lombok.Setter;
import org.springframework.hateoas.RepresentationModel;

import java.util.List;

public class FiltersResponseDto extends RepresentationModel<FiltersResponseDto> {
    @Getter
    @Setter
    private List<FilterSectionDto> filters;
}
