package com.officely.backend.modules.flatly.api.offices.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.hateoas.RepresentationModel;

@Setter
@Getter
public class OfficeItemDto extends RepresentationModel<OfficeItemDto> {
    private String id;
    private String name;
    private String floor; //Why string? also in room
    private String room;
}
