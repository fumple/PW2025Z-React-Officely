package com.officely.backend.flatly.api.offices.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

public class OfficeSearchResultDto {
    private OfficeDto office;
    private OfficeSearchQueryDetailsDto query;

    @JsonProperty("_links")
    private Links links;

    public OfficeSearchResultDto() {}

    public OfficeSearchResultDto(OfficeDto office, OfficeSearchQueryDetailsDto query, Links links){
        this.office = office;
        this.query = query;
        this.links = links;
    }

    public OfficeDto getOffice() { return office; }
    public void setOffice(OfficeDto office) { this.office = office; }

    public OfficeSearchQueryDetailsDto getQuery() { return query; }
    public void setQuery(OfficeSearchQueryDetailsDto query) { this.query = query; }

    public Links getLinks() { return links; }
    public void setLinks(Links links) { this.links = links; }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Links {
        private String offers;

        public Links() {}

        public Links(String offers) { this.offers = offers; }
        public String getOffers() { return offers; } public void setOffers(String offers) { this.offers = offers; }
    }
}
