package com.officely.backend.modules.admin.api.users.officeoffers;

import lombok.Getter;
import lombok.Setter;
import org.springframework.hateoas.RepresentationModel;

import java.util.List;
import java.util.Map;

@Getter
@Setter
public class OfficeOfferDto extends RepresentationModel<OfficeOfferDto> {
    private String id;
    private String officeId;
    private String name;
    private String publicName;
    private int pricePerDay;
    private String pricePerDayCurrency;
    private int freeCancellationHours;
    private int paymentHours;
    private boolean available;
    private List<String> photoUrls;
    private Map<String, String> properties;
}
