package com.officely.backend.modules.admin.controller;

import com.officely.backend.api.PaginatedResponse;
import com.officely.backend.api.pagination.PaginationDto;
import com.officely.backend.api.throwables.ValidationException;
import com.officely.backend.entity.BookingEntity;
import com.officely.backend.entity.UserEntity;
import com.officely.backend.modules.admin.api.bookings.AdminBookingMapper;
import com.officely.backend.modules.admin.api.bookings.BookingCancelRequest;
import com.officely.backend.modules.admin.api.bookings.BookingDto;
import com.officely.backend.modules.admin.services.AdminPermissionService;
import com.officely.backend.service.BookingService;
import com.officely.backend.service.OfficeService;
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
    private final OfficeService officeService;

    private BookingDto bookingToDto(BookingEntity booking) {
        var e = bookingMapper.bookingToBookingDto(booking);
        e.add(
                linkTo(AdminBookingsController.class).slash(e.getId()).withSelfRel(),
                linkTo(AdminUsersController.class).slash(e.getUserId()).withRel("user"),
                linkTo(AdminOfficesController.class).slash(e.getOfficeId()).withRel("office"),
                linkTo(methodOn(AdminOfficeItemsController.class).getItem(booking.getOffice().getId(), booking.getItem().getId())).withRel("item"),
                linkTo(methodOn(AdminOfficeOffersController.class).getOffer(booking.getOffice().getId(), booking.getOffer().getId())).withRel("offer")
        );
        if(bookingService.canBookingBeCancelled(booking, true) != null) {
            e.add(linkTo(methodOn(AdminBookingsController.class).cancelBooking(booking.getId(), null)).withRel("cancel"));
        }
        if(bookingService.canBookingBeMarkedAsPaid(booking)) {
            e.add(linkTo(methodOn(AdminBookingsController.class).markBookingAsPaid(booking.getId())).withRel("markPaid"));
        }
        if(bookingService.canBookingBeMarkedAsRefunded(booking)) {
            e.add(linkTo(methodOn(AdminBookingsController.class).markBookingAsRefunded(booking.getId())).withRel("markRefunded"));
        }
        return e;
    }

    @GetMapping
    public ResponseEntity<PaginatedResponse<BookingDto>> getBookings(@RequestParam @Valid @Min(1) @Max(50) int pageSize, @RequestParam(required = false) Integer pageToken,
                                                                     @RequestParam(required = false) Long officeId,
                                                                     @RequestParam(required = false) String sortField, @RequestParam(required = false) String sortDirection) {
        var actor = (UserEntity) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        var currentPage = pageToken == null ? 0 : pageToken;
        var pageRequest = PageRequest.of(currentPage, pageSize);

        if(sortField != null && sortDirection != null) {
            pageRequest = pageRequest.withSort(sortDirection.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, sortField);
        }

        if(officeId != null) {
            var targetOpt = officeService.getOfficeById(officeId);
            if(targetOpt.isEmpty())
                throw new ValidationException("officeId", "The provided office was not found or you can't access it");

            var target = targetOpt.get();
            if(!adminPermissionService.canManageOffice(actor, target)) {
                throw new ValidationException("officeId", "The provided office was not found or you can't access it");
            }
        }
        var bookings = officeId != null ? bookingService.getBookings(officeId, pageRequest) : bookingService.getBookings(actor, pageRequest);
        var response = new PaginatedResponse<BookingDto>();
        response.setResults(bookings.get()
                .map(this::bookingToDto).toList());

        var pagination = new PaginationDto();
        pagination.setLastPage(Math.max(bookings.getTotalPages() - 1, 0));
        pagination.setCurrentPage(currentPage);
        pagination.setPageSize(pageSize);
        response.setPagination(pagination);

        response.add(
                linkTo(methodOn(AdminBookingsController.class).getBookings(pageSize, currentPage, officeId, sortField, sortDirection))
                        .withSelfRel().expand(),
                linkTo(methodOn(AdminBookingsController.class).getBookings(pageSize, 0, officeId, sortField, sortDirection))
                        .withRel("first").expand(),
                linkTo(methodOn(AdminBookingsController.class).getBookings(pageSize, pagination.getLastPage(), officeId, sortField, sortDirection))
                        .withRel("last").expand()
        );
        if(currentPage != pagination.getLastPage()) {
            response.add(
                    linkTo(methodOn(AdminBookingsController.class).getBookings(pageSize, currentPage+1, officeId, sortField, sortDirection))
                            .withRel("next").expand()
            );
        }
        if(currentPage > 0) {
            response.add(
                    linkTo(methodOn(AdminBookingsController.class).getBookings(pageSize, currentPage-1, officeId, sortField, sortDirection))
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

        var response = bookingToDto(target);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{bookingId}/cancel")
    public ResponseEntity<Void> cancelBooking(@PathVariable Long bookingId, @RequestBody @Valid BookingCancelRequest request) {
        var actor = (UserEntity) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        var targetOpt = bookingService.getBookingById(bookingId);
        if(targetOpt.isEmpty())
            return ResponseEntity.notFound().build();

        var target = targetOpt.get();
        if(!adminPermissionService.canAccessBooking(actor, target)) {
            return ResponseEntity.notFound().build();
        }
        bookingService.cancelBookingAsStaff(target, request.isWithRefund(), request.getReason());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{bookingId}/markPaid")
    public ResponseEntity<Void> markBookingAsPaid(@PathVariable Long bookingId) {
        var actor = (UserEntity) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        var targetOpt = bookingService.getBookingById(bookingId);
        if(targetOpt.isEmpty())
            return ResponseEntity.notFound().build();

        var target = targetOpt.get();
        if(!adminPermissionService.canAccessBooking(actor, target)) {
            return ResponseEntity.notFound().build();
        }

        bookingService.markBookingAsPaid(target);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{bookingId}/markRefunded")
    public ResponseEntity<Void> markBookingAsRefunded(@PathVariable Long bookingId) {
        var actor = (UserEntity) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        var targetOpt = bookingService.getBookingById(bookingId);
        if(targetOpt.isEmpty())
            return ResponseEntity.notFound().build();

        var target = targetOpt.get();
        if(!adminPermissionService.canAccessBooking(actor, target)) {
            return ResponseEntity.notFound().build();
        }

        bookingService.markBookingAsRefunded(target);
        return ResponseEntity.ok().build();
    }
}

