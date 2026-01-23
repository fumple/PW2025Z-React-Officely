package com.officely.backend.modules.admin.api.offices;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OfficePostRequest {
    @NotBlank
    private String name;
    @NotBlank
    private String description;
    @NotBlank
    private String address;
    @NotBlank
    private String contactEmail;
    @NotBlank
    private String contactPhone;
    @NotBlank
    private String paymentAccountNumber;
    @NotBlank
    private String paymentReceiverName;
}
