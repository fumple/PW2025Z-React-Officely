package com.officely.backend.modules.admin.api.officeitems;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.validator.constraints.Length;

@Getter
@Setter
public class OfficeItemPostRequest {
    public enum Types {
        SHARED,
        INDIVIDUAL
    }
    @NotBlank
    @Length(max = 64)
    private String name;
    @NotBlank
    @Length(max = 8)
    private String floor;
    @NotBlank
    @Length(max = 16)
    private String room;
    @NotNull
    private Long offerId;
    @NotNull
    private Types type;
    @Min(1)
    private Integer capacity;
}
