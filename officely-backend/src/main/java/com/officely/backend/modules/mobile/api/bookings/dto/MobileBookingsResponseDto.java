package com.officely.backend.modules.mobile.api.bookings.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.officely.backend.api.pagination.PaginationDto;
import lombok.Getter;
import lombok.Setter;
import org.springframework.hateoas.RepresentationModel;

import java.util.List;

@Getter
@Setter
public class MobileBookingsResponseDto extends RepresentationModel<MobileBookingsResponseDto> {
    private List<MobileBookingDto> bookings;

    @JsonProperty("_pagination")
    private PaginationDto pagination;
}
