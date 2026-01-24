package com.officely.backend.modules.flatly.api.bookings.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.officely.backend.api.pagination.PaginationDto;
import lombok.Getter;
import lombok.Setter;
import org.springframework.hateoas.RepresentationModel;

import java.util.List;

@Getter
@Setter
public class BookingsResponseDto extends RepresentationModel<BookingsResponseDto> {
    private List<BookingDto> bookings;

    @JsonProperty("_pagination")
    private PaginationDto pagination;
}
