package com.officely.backend.modules.admin.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.officely.backend.api.pagination.PaginationDto;
import lombok.Getter;
import lombok.Setter;
import org.springframework.hateoas.RepresentationModel;

import java.util.List;

@Getter
@Setter
public class PaginatedResponse<T> extends RepresentationModel<PaginatedResponse<T>> {
    private List<T> results;
    @JsonProperty("_pagination")
    private PaginationDto pagination;
}
