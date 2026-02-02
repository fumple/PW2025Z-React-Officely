package com.officely.backend.modules.flatly.api.offices.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.officely.backend.api.pagination.PaginationDto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.springframework.hateoas.RepresentationModel;

import java.util.List;

@Setter
@Getter
public class OfficeSearchResponseDto extends RepresentationModel<OfficeSearchResponseDto> {
    private List<OfficeSearchResultDto> results;
    private Query query;

    @JsonProperty("_pagination")
    private PaginationDto pagination;

    @Setter
    @Getter
    @AllArgsConstructor
    public static class Query {
        private int minPrice;
        private int maxPrice;
    }
}