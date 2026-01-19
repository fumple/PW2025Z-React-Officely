package com.officely.backend.modules.flatly.api.offices.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.Map;

public class OfficeOfferDto {
    private String id;
    private String name;
    private Integer totalPrice;
    private Integer freeCancellationHours;
    private Integer paymentHours;
    private List<String> photoUrls;
    private Map<String, String> properties;

    @JsonProperty("_links")
    private Links links;

    public OfficeOfferDto() {}

    public OfficeOfferDto(String id, String name, Integer totalPrice, Integer freeCancellationHours,
                          Integer paymentHours, List<String> photoUrls, Map<String, String> properties,
                          Links links) {
        this.id = id;
        this.name = name;
        this.totalPrice = totalPrice;
        this.freeCancellationHours = freeCancellationHours;
        this.paymentHours = paymentHours;
        this.photoUrls = photoUrls;
        this.properties = properties;
        this.links = links;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getTotalPrice() { return totalPrice; }
    public void setTotalPrice(Integer totalPrice) { this.totalPrice = totalPrice; }

    public Integer getFreeCancellationHours() { return freeCancellationHours; }
    public void setFreeCancellationHours(Integer freeCancellationHours) { this.freeCancellationHours = freeCancellationHours    ; }

    public Integer getPaymentHours() { return paymentHours; }
    public void setPaymentHours(Integer paymentHours) { this.paymentHours = paymentHours; }

    public List<String> getPhotoUrls() { return photoUrls; }
    public void setPhotoUrls(List<String> photoUrls) { this.photoUrls = photoUrls; }

    public Map<String, String> getProperties() { return properties; }
    public void setProperties(Map<String, String> properties) { this.properties = properties; }

    public Links getLinks() { return links; }
    public void setLinks(Links links) { this.links = links; }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Links {
        private String accept;

        public Links() {}

        public Links(String accept) { this.accept = accept; }
        public String getAccept() { return accept; }
        public void setAccept(String accept) { this.accept = accept; }
    }
}