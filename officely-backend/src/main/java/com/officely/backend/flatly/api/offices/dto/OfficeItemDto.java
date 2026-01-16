package com.officely.backend.flatly.api.offices.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

public class OfficeItemDto {
    private String id;
    private String name;
    private String description;
    private String floor; //Why string? also in room
    private String room;

    @JsonProperty("_links")
    private Links links;

    public OfficeItemDto() {}

    public OfficeItemDto(String id, String name, String description, String floor, String room,
                     Links links){
        this.id = id;
        this.name = name;
        this.description = description;
        this.floor = floor;
        this.room = room;
        this.links = links;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getFloor() { return floor; }
    public void setFloor(String floor) { this.floor = floor; }

    public String getRoom() { return room; }
    public void setRoom(String room) { this.room = room; }

    public Links getLinks() { return links; }
    public void setLinks(Links links) { this.links = links; }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Links {
        private String self;

        public Links() {}

        public Links(String self) { this.self = self; }
        public String getSelf() { return self; } public void setSelf(String self) { this.self = self; }
    }
}
