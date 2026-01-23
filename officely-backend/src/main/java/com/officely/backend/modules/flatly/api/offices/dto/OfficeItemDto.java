package com.officely.backend.modules.flatly.api.offices.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class OfficeItemDto {
    private String id;
    private String name;
    private String floor; //Why string? also in room
    private String room;

    @JsonProperty("_links")
    private Links links;

    @Setter
    @Getter
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Links {
        private String self;

        public Links() {}

        public Links(String self) { this.self = self; }

    }
}
