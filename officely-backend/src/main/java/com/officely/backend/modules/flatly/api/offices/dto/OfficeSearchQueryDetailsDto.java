package com.officely.backend.modules.flatly.api.offices.dto;

public class OfficeSearchQueryDetailsDto {
    private Integer minPrice;
    private Integer distance;

    public OfficeSearchQueryDetailsDto() {}

    public OfficeSearchQueryDetailsDto(Integer minPrice, Integer distance) {
        this.minPrice = minPrice;
        this.distance = distance;
    }

    public Integer getMinPrice() { return minPrice; }
    public void setMinPrice(Integer minPrice) { this.minPrice = minPrice; }

    public Integer getDistance() { return distance; }
    public void setDistance(Integer distance) { this.distance = distance; }
}
