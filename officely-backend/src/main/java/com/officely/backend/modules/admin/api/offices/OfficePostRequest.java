package com.officely.backend.modules.admin.api.offices;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.validator.constraints.Length;

@Getter
@Setter
public class OfficePostRequest {
    @NotBlank
    @Length(max = 64)
    private String name;

    @NotBlank
    @Length(max = 4096)
    private String description;

    @NotBlank
    @Length(max = 256)
    private String address;

    @NotBlank
    @Email
    @Length(max = 256)
    private String contactEmail;

    @NotBlank
    @Length(max = 16)
    private String contactPhone;

    @NotBlank
    @Length(max = 34)
    private String paymentAccountNumber;

    @NotBlank
    @Length(max = 64)
    private String paymentReceiverName;
}
