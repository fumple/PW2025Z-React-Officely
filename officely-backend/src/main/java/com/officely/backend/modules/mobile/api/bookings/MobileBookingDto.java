package com.officely.backend.modules.mobile.api.bookings;

import lombok.Getter;
import lombok.Setter;
import org.springframework.hateoas.RepresentationModel;

@Getter
@Setter
public class MobileBookingDto extends RepresentationModel<MobileBookingDto> {
    private Long id;

    private String officeName;

    private String startDate;
    private String endDate;

    private Integer totalPrice;

    private String status;
    private String paymentStatus;
}