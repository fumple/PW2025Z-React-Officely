package com.officely.backend.modules.admin.controller;

import com.officely.backend.api.pagination.PaginationDto;
import com.officely.backend.entity.UserEntity;
import com.officely.backend.modules.admin.api.users.*;
import com.officely.backend.modules.admin.services.AdminPermissionService;
import com.officely.backend.service.BookingService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@RestController
@RequestMapping("/admin/bookings")
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class AdminBookingsController {
    private final BookingService bookingService;
    private final AdminPermissionService adminPermissionService;
    private final AdminBookingMapper bookingMapper;

    @GetMapping
    public ResponseEntity<PaginatedResponse<BookingDto>> getBookings(@RequestParam @Valid @Min(1) @Max(50) int pageSize, @RequestParam(required = false) Integer pageToken,
                                                  @RequestParam(required = false) String search,
                                                  @RequestParam(required = false) String sortField, @RequestParam(required = false) String sortDirection) {
        var currentPage = pageToken == null ? 0 : pageToken;
        var pageRequest = PageRequest.of(currentPage, pageSize);

        if(sortField != null && sortDirection != null) {
            pageRequest = pageRequest.withSort(sortDirection.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, sortField);
        }

        var bookings = search != null ? bookingService.getBookings(pageRequest, search) : bookingService.getBookings(pageRequest);
        var response = new PaginatedResponse<BookingDto>();
        response.setResults(bookings.get().map(bookingMapper::bookingToBookingDto).map(e ->
            e.add(
                    linkTo(AdminBookingsController.class).slash(e.getId()).withSelfRel(),
                    linkTo(AdminBookingsController.class).slash(e.getId()).withRel("update")
            )
        ).toList());

        var pagination = new PaginationDto();
        pagination.setLastPage(bookings.getTotalPages() - 1);
        pagination.setCurrentPage(currentPage);
        pagination.setPageSize(pageSize);
        response.setPagination(pagination);

        response.add(
                linkTo(methodOn(AdminBookingsController.class).getBookings(pageSize, currentPage, search, sortField, sortDirection))
                        .withSelfRel().expand(),
                linkTo(methodOn(AdminBookingsController.class).getBookings(pageSize, 0, search, sortField, sortDirection))
                        .withRel("first").expand(),
                linkTo(methodOn(AdminBookingsController.class).getBookings(pageSize, pagination.getLastPage(), search, sortField, sortDirection))
                        .withRel("last").expand()
        );
        if(currentPage != pagination.getLastPage()) {
            response.add(
                    linkTo(methodOn(AdminBookingsController.class).getBookings(pageSize, currentPage+1, search, sortField, sortDirection))
                            .withRel("next").expand()
            );
        }
        if(currentPage > 0) {
            response.add(
                    linkTo(methodOn(AdminBookingsController.class).getBookings(pageSize, currentPage-1, search, sortField, sortDirection))
                            .withRel("prev").expand()
            );
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<BookingDto> getBooking(@PathVariable Long bookingId) {
        var actor = (UserEntity) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        var targetOpt = bookingService.getBookingById(bookingId);
        if(targetOpt.isEmpty())
            return ResponseEntity.notFound().build();

        var target = targetOpt.get();
        if(!adminPermissionService.canAccessBooking(actor, target)) {
            return ResponseEntity.notFound().build();
        }

        var response = bookingMapper.bookingToBookingDto(target);
        response.add(linkTo(methodOn(AdminBookingsController.class).getBooking(bookingId)).withSelfRel());

        return ResponseEntity.ok(response);
    }
}

