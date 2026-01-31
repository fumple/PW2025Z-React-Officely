package com.officely.backend.modules.mobile.controller;

import com.officely.backend.api.PaginatedResponse;
import com.officely.backend.api.pagination.PaginationDto;
import com.officely.backend.entity.BookingEntity;
import com.officely.backend.entity.UserEntity;
import com.officely.backend.modules.mobile.api.bookings.MobileBookingDto;
import com.officely.backend.modules.mobile.api.bookings.MobileBookingMapper;
import com.officely.backend.service.BookingService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@RestController
@RequestMapping("/mobile/bookings")
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class MobileBookingsController {
    private final BookingService bookingService;
    private final MobileBookingMapper bookingMapper;

    private MobileBookingDto toDto(BookingEntity e) {
        var dto = bookingMapper.toDto(e);
        dto.add(
                linkTo(methodOn(MobileBookingsController.class).getBooking(e.getId())).withSelfRel(),
                linkTo(methodOn(MobileBookingsController.class).cancelBooking(e.getId())).withRel("cancel")
        );
        return dto;
    }

    @GetMapping
    public ResponseEntity<PaginatedResponse<MobileBookingDto>> getMyBookings(
            @RequestParam @Valid @Min(1) @Max(50) int pageSize,
            @RequestParam(required = false) Integer pageToken
    ) {
        var actor = (UserEntity) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        var page = bookingService.getUserBookings(actor.getId(), pageSize, pageToken);

        var response = new PaginatedResponse<MobileBookingDto>();
        response.setResults(page.getContent().stream().map(this::toDto).toList());

        var pagination = new PaginationDto();
        pagination.setLastPage(Math.max(page.getTotalPages() - 1, 0));
        pagination.setCurrentPage(page.getNumber());
        pagination.setPageSize(pageSize);
        response.setPagination(pagination);

        response.add(
                linkTo(methodOn(MobileBookingsController.class).getMyBookings(pageSize, page.getNumber())).withSelfRel().expand(),
                linkTo(methodOn(MobileBookingsController.class).getMyBookings(pageSize, 0)).withRel("first").expand(),
                linkTo(methodOn(MobileBookingsController.class).getMyBookings(pageSize, pagination.getLastPage())).withRel("last").expand()
        );
        if (pagination.getCurrentPage() != pagination.getLastPage()) {
            response.add(linkTo(methodOn(MobileBookingsController.class)
                    .getMyBookings(pageSize, pagination.getCurrentPage() + 1)).withRel("next").expand());
        }
        if (pagination.getCurrentPage() > 0) {
            response.add(linkTo(methodOn(MobileBookingsController.class)
                    .getMyBookings(pageSize, pagination.getCurrentPage() - 1)).withRel("prev").expand());
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<MobileBookingDto> getBooking(@PathVariable long bookingId) {
        var actor = (UserEntity) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        var bookingOpt = bookingService.getBookingInfo(actor.getId(), bookingId);
        if (bookingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(toDto(bookingOpt.get()));
    }

    @PostMapping("/{bookingId}/cancel")
    public ResponseEntity<Void> cancelBooking(@PathVariable long bookingId) {
        var actor = (UserEntity) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        var bookingOpt = bookingService.getBookingInfo(actor.getId(), bookingId);
        if (bookingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        bookingService.cancelBooking(bookingOpt.get());
        return ResponseEntity.ok().build(); // spec says 200
    }

}
