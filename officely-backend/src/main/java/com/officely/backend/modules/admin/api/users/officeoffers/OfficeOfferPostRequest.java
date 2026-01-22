package com.officely.backend.modules.admin.api.users.officeoffers;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class OfficeOfferPostRequest {
    private String sourceId;

    @NotBlank
    private String name;

    private String publicName;

    @Min(1)
    private int pricePerDay;

    @NotBlank
    private String pricePerDayCurrency;

    private Integer freeCancellationHours;

    private int paymentHours;

    @NotNull
    private Map<String, String> properties;
}
