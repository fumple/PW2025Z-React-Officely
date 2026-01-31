package com.officely.backend.modules.admin.api.offices;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.validator.constraints.Length;

import java.util.List;

@Getter
@Setter
public class OfficePatchRequest {
    @Length(max = 64)
    private String name;

    @Length(max = 4096)
    private String description;

    @Length(max = 1024)
    private String openingHours;

    @Length(max = 256)
    private String address;

    @Length(max = 256)
    @Email
    private String contactEmail;

    @Pattern(regexp = "^\\+[1-9]\\d{1,14}$")
    private String contactPhone;

    @Length(max = 34)
    private String paymentAccountNumber;

    @Length(max = 64)
    private String paymentReceiverName;
    private boolean published;
    private List<String> images;
}
