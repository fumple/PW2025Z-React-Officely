package com.officely.backend.modules.admin.api.officeoffers;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.validator.constraints.Length;

import java.util.Map;

@Getter
@Setter
public class OfficeOfferPostRequest {
    private Long sourceId;

    @NotBlank
    @Length(max = 64)
    private String name;

    @Length(max = 64)
    private String publicName;

    @Min(1)
    private int pricePerDay;

    @NotBlank
    @Length(max = 3)
    private String pricePerDayCurrency;

    @Min(0)
    @Max(24*31)
    private int freeCancellationHours;

    @Min(1)
    @Max(24*31)
    private int paymentHours;

    @NotNull
    private Map<String, String> properties;
}
