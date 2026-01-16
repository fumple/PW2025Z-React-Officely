package com.officely.backend.api.filters;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class FiltersResponseDto {
    private List<FilterSectionDto> filters;

    @JsonProperty("_links")
    private Links links;

    public FiltersResponseDto() {}

    public List<FilterSectionDto> getFilters() { return filters; }
    public void setFilters(List<FilterSectionDto> filters) { this.filters = filters; }

    public Links getLinks() { return links; }
    public void setLinks(Links links) { this.links = links; }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Links {
        private String self;

        public String getSelf() { return self; }
        public void setSelf(String self) { this.self = self; }
    }
}
