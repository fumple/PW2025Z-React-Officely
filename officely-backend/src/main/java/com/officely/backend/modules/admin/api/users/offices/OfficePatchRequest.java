package com.officely.backend.modules.admin.api.users.offices;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class OfficePatchRequest {
    private String name;
    private String description;
    private String address;
    private String contactEmail;
    private String contactPhone;
    private String paymentAccountNumber;
    private String paymentReceiverName;
    private boolean published;
    private List<String> images;
}
