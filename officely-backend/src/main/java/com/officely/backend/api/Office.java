package com.officely.backend.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.officely.backend.entity.WorkspaceType;

import java.util.List;

public class Office {
    private String name;
    private String description;
    private String address;

    @JsonProperty("min_price")
    private Integer minPrice;

    @JsonProperty("max_price")
    private Integer maxPrice;

    @JsonProperty("photo_urls")
    private List<String> photoUrls;

    private Double latitude;
    private Double longitude;

    @JsonProperty("distance_meters")
    private Double distanceMeters;

    @JsonProperty("workspace_type")
    private WorkspaceType workspaceType;

    private Boolean wifi;
    private Boolean access24h;
    private Boolean kitchen;
    private Boolean parking;

    @JsonProperty("wheelchair_accessible")
    private Boolean wheelchairAccessible;

    private Boolean quiet;
    private Boolean social;

    private Boolean monitor;
    private Boolean printer;

    public Office() {}

    public Office(String name, String description, String address, Integer minPrice,
                  Integer maxPrice, List<String> photoUrls, Double latitude, Double longitude,
                  Double distanceMeters, WorkspaceType workspaceType, Boolean wifi, Boolean access24h,
                  Boolean kitchen, Boolean parking, Boolean wheelchairAccessible, Boolean quiet,
                  Boolean social, Boolean monitor, Boolean printer)
    {
        this.name = name;
        this.description = description;
        this.address = address;
        this.minPrice = minPrice;
        this.maxPrice = maxPrice;
        this.photoUrls = photoUrls;
        this.latitude = latitude;
        this.longitude = longitude;
        this.distanceMeters = distanceMeters;
        this.workspaceType = workspaceType;
        this.wifi = wifi;
        this.access24h = access24h;
        this.kitchen = kitchen;
        this.parking = parking;
        this.wheelchairAccessible = wheelchairAccessible;
        this.quiet = quiet;
        this.social = social;
        this.monitor = monitor;
        this.printer = printer;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Integer getMinPrice() { return minPrice; }
    public void setMinPrice(Integer min_price) { this.minPrice = min_price; }

    public Integer getMaxPrice() { return maxPrice; }
    public void setMaxPrice(Integer max_price) { this.maxPrice = max_price; }

    public List<String> getPhotoUrls() { return photoUrls; }
    public void setPhotoUrls(List<String> photo_urls) { this.photoUrls = photo_urls; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Double getDistanceMeters() { return distanceMeters; }
    public void setDistanceMeters(Double distanceMeters) { this.distanceMeters = distanceMeters; }

    public WorkspaceType getWorkspaceType() {return workspaceType;}
    public void setWorkspaceType(WorkspaceType workspaceType) {this.workspaceType = workspaceType;}

    public Boolean getWifi() {return wifi;}
    public void setWifi(Boolean wifi) {this.wifi = wifi;}

    public Boolean getAccess24h() {return access24h;}
    public void setAccess24h(Boolean access24h) {this.access24h = access24h;}

    public Boolean getKitchen() {return kitchen;}
    public void setKitchen(Boolean kitchen) {this.kitchen = kitchen;}

    public Boolean getParking() {return parking;}
    public void setParking(Boolean parking) {this.parking = parking;}

    public Boolean getWheelchairAccessible() {return wheelchairAccessible;}
    public void setWheelchairAccessible(Boolean wheelchairAccessible) {this.wheelchairAccessible = wheelchairAccessible;}

    public Boolean getQuiet() {return quiet;}
    public void setQuiet(Boolean quiet) {this.quiet = quiet;}

    public Boolean getSocial() {return social;}
    public void setSocial(Boolean social) {this.social = social;}

    public Boolean getMonitor() {return monitor;}
    public void setMonitor(Boolean monitor) {this.monitor = monitor;}

    public Boolean getPrinter() {return printer;}
    public void setPrinter(Boolean printer) {this.printer = printer;}
}


