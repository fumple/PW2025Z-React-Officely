package com.officely.backend.api.offices.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class OfficeDto {
    private String id;
    private String name;
    private String description;
    private String address;

    private List<String> photoUrls;
    private String contactEmail;
    private String contactPhone;

    @JsonProperty("_links")
    private Links links;

    private CoordinatesDto coordinates;

    public OfficeDto() {}

    public OfficeDto(String id, String name, String description, String address, List<String> photoUrls,
                     String contactEmail, String contactPhone, Links links,
                     CoordinatesDto coordinates)
    {
        this.id = id;
        this.name = name;
        this.description = description;
        this.address = address;
        this.photoUrls = photoUrls;
        this.contactEmail = contactEmail;
        this.contactPhone = contactPhone;
        this.links = links;
        this.coordinates = coordinates;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public List<String> getPhotoUrls() { return photoUrls; }
    public void setPhotoUrls(List<String> photo_urls) { this.photoUrls = photo_urls; }

    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public Links getLinks() { return links; }
    public void setLinks(Links links) { this.links = links; }

    public CoordinatesDto getCoordinates() { return coordinates; }
    public void setCoordinates(CoordinatesDto coordinates) { this.coordinates = coordinates; }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Links {
        private String self;

        public Links() {}

        public Links(String self) { this.self = self; }

        public String getSelf() { return self; }
        public void setSelf(String self) { this.self = self; }
    }
}


