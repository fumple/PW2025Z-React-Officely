package com.officely.backend.modules.admin.api.officeitems;

import lombok.Getter;
import lombok.Setter;
import org.springframework.hateoas.RepresentationModel;

@Getter
@Setter
public class OfficeItemDto extends RepresentationModel<OfficeItemDto> {
    private String id;
    private String officeId;
    private String name;
    private String floor;
    private String room;
    private String offerId;
    private String type;
    private boolean available;
    private int capacity;
}
