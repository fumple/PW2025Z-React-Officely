package com.officely.backend.modules.admin.api.offices;

import lombok.Getter;
import lombok.Setter;
import org.springframework.hateoas.RepresentationModel;

import java.util.List;

@Getter
@Setter
public class OfficeDto extends RepresentationModel<OfficeDto> {
    @Getter
    @Setter
    public static class Coordinates {
        public double lat;
        public double lon;
    }

    public String id;
    public String ownerId;
    public String name;
    public String description;
    public String address;
    public Coordinates coordinates;
    public List<String> photoUrls;
    public String contactEmail;
    public String contactPhone;
    public boolean published;
    public String paymentAccountNumber;
    public String paymentReceiverName;
}
