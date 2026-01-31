package com.officely.backend.modules.admin.api.offices;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
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
    @Length(max = 1024)
    private String openingHours;

    @NotBlank
    @Length(max = 256)
    private String address;

    @NotBlank
    @Email
    @Length(max = 256)
    private String contactEmail;

    @NotBlank
    @Pattern(regexp = "^\\+[1-9]\\d{1,14}$")
    private String contactPhone;

    @NotBlank
    @Length(max = 34)
    private String paymentAccountNumber;

    @NotBlank
    @Length(max = 64)
    private String paymentReceiverName;
}
