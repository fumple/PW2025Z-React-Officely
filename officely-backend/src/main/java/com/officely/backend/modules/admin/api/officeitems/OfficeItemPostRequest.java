package com.officely.backend.modules.admin.api.officeitems;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OfficeItemPostRequest {
    public enum Types {
        SHARED,
        INDIVIDUAL
    }
    @NotBlank
    private String name;
    @NotBlank
    private String floor;
    @NotBlank
    private String room;
    @NotNull
    private Long offerId;
    @NotNull
    private Types type;
    @Min(1)
    private Integer capacity;
}
