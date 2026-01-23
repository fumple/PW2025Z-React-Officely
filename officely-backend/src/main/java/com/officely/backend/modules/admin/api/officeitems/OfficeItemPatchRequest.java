package com.officely.backend.modules.admin.api.officeitems;

import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OfficeItemPatchRequest {
    private String name;
    private String floor;
    private String room;
    private Long offerId;
    private boolean available;
    @Min(1)
    private Integer capacity;
}
