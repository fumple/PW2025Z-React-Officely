package com.officely.backend.api.offices.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class OfficeOffersResponseDto {
    private List<OfficeOfferDto> offers;

    @JsonProperty("_links")
    private Links links;

    public OfficeOffersResponseDto() {}

    public List<OfficeOfferDto> getOffers() { return offers; }
    public void setOffers(List<OfficeOfferDto> offers) { this.offers = offers; }

    public Links getLinks() { return links; }
    public void setLinks(Links links) { this.links = links; }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Links {

        private String self;

        public Links() {}

        public Links(String self) {
            this.self = self;
        }

        public String getSelf() { return self; }
        public void setSelf(String self) { this.self = self; }
    }
}
