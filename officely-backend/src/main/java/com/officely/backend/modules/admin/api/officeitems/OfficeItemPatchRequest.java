package com.officely.backend.modules.admin.api.officeitems;

import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.validator.constraints.Length;

@Getter
@Setter
public class OfficeItemPatchRequest {
    @Length(max = 64)
    private String name;
    @Length(max = 8)
    private String floor;
    @Length(max = 16)
    private String room;
    private Long offerId;
    private Boolean available;
    @Min(1)
    private Integer capacity;
}
