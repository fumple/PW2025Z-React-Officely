package com.officely.backend.modules.flatly.controller;

import com.officely.backend.api.CreatedResponse;
import com.officely.backend.api.pagination.PaginationDto;
import com.officely.backend.entity.BookingEntity;
import com.officely.backend.entity.UserType;
import com.officely.backend.modules.flatly.api.bookings.dto.BookingDto;
import com.officely.backend.modules.flatly.api.bookings.dto.BookingsResponseDto;
import com.officely.backend.modules.flatly.api.bookings.mapper.BookingMapper;
import com.officely.backend.modules.flatly.api.users.dto.CreateUserRequestDto;
import com.officely.backend.modules.flatly.api.users.dto.PatchUserRequestDto;
import com.officely.backend.modules.flatly.api.users.dto.UsersResponseDto;
import com.officely.backend.modules.flatly.api.users.mapper.UserMapper;
import com.officely.backend.service.BookingService;
import com.officely.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@RestController
@RequestMapping("/flatly/users")
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class FlatlyUserController {
    private final UserService userService;
    private final BookingService bookingService;
    private final UserMapper userMapper;

    @GetMapping
    public UsersResponseDto getUserByEmail(@RequestParam String email) {
        var response = new UsersResponseDto();
        var users = userService.findByTypeAndEmail(UserType.FLATLY_CUSTOMER, email);
        if(users.isPresent()) {
            var user = userMapper.userToDto(users.get());
            user.add(
                    linkTo(FlatlyUserController.class).slash(user.getId()).withSelfRel(),
                    linkTo(FlatlyUserController.class).slash(user.getId()).withRel("update"),
                    linkTo(FlatlyUserController.class).slash(user.getId())
                            .slash("bookings").withRel("bookings")
            );

            response.setUsers(List.of(user));
        } else {
            response.setUsers(List.of());
        }

        response.add(linkTo(FlatlyUserController.class).withRel("create"));
        return response;
    }

    @PostMapping
    public ResponseEntity<CreatedResponse> createUser(@RequestBody @Valid CreateUserRequestDto request) {
        var user = userMapper.createRequestToUser(request);
        user.setType(UserType.FLATLY_CUSTOMER);
        var created = userService.createUser(user);
        return ResponseEntity.created(linkTo(FlatlyUserController.class).slash(created.getId()).toUri())
                .body(new CreatedResponse(created.getId().toString()));
    }

    @PatchMapping("/{userId}")
    public ResponseEntity<Void> patchUser(@PathVariable long userId, @RequestBody PatchUserRequestDto request){
        var userOpt = userService.findById(userId);
        if(userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        var user = userOpt.get();
        userMapper.update(request, user);
        userService.patchUser(user);
        return ResponseEntity.noContent().build();
    }

    private BookingDto toDto(BookingEntity entity) {
        var dto = BookingMapper.toDto(entity);
        dto.add(
                linkTo(methodOn(FlatlyUserController.class).getUsersBookingInfo(entity.getUser().getId(), entity.getId())).withSelfRel(),
                linkTo(methodOn(FlatlyOfficesController.class).getOffice(entity.getOffice().getId())).withRel("office"),
                linkTo(methodOn(FlatlyOfficesController.class).getOfficeItemDetails(entity.getOffice().getId(), entity.getItem().getId())).withRel("item"),
                linkTo(methodOn(FlatlyOfficesController.class).getOfficeOfferDetails(entity.getOffice().getId(), entity.getOffer().getId())).withRel("offer")
        );
        if(bookingService.canBookingBeCancelled(entity, false) == null) {
            dto.add(linkTo(methodOn(FlatlyUserController.class).cancelBooking(entity.getUser().getId().toString(), entity.getId().toString())).withRel("cancel"));
        }
        return dto;
    }

    @GetMapping("/{userId}/bookings/{bookingId}")
    public BookingDto getUsersBookingInfo(@PathVariable long userId, @PathVariable long bookingId){
        return toDto(bookingService.getBookingInfo(userId, bookingId));
    }

    @GetMapping("/{userId}/bookings")
    public BookingsResponseDto getUsersBookings(@PathVariable Long userId, @RequestParam int pageSize,
                                                @RequestParam(required = false) Integer pageToken){
        var response = new BookingsResponseDto();
        var results = bookingService.getUserBookings(userId, pageSize, pageToken);
        response.setBookings(results.get().map(this::toDto).toList());

        var pagination = new PaginationDto();
        pagination.setLastPage(Math.max(results.getTotalPages() - 1, 0));
        pagination.setCurrentPage(results.getPageable().getPageNumber());
        pagination.setPageSize(results.getPageable().getPageSize());
        response.setPagination(pagination);

        response.add(
                linkTo(methodOn(FlatlyUserController.class).getUsersBookings(userId, pageSize, pagination.getCurrentPage()))
                        .withSelfRel().expand(),
                linkTo(methodOn(FlatlyUserController.class).getUsersBookings(userId, pageSize, 0))
                        .withRel("first").expand(),
                linkTo(methodOn(FlatlyUserController.class).getUsersBookings(userId, pageSize, pagination.getLastPage()))
                        .withRel("last").expand()
        );
        if(pagination.getCurrentPage() != pagination.getLastPage()) {
            response.add(
                    linkTo(methodOn(FlatlyUserController.class).getUsersBookings(userId, pageSize, pagination.getCurrentPage()+1))
                            .withRel("next").expand()
            );
        }
        if(pagination.getCurrentPage() > 0) {
            response.add(
                    linkTo(methodOn(FlatlyUserController.class).getUsersBookings(userId, pageSize, pagination.getCurrentPage()-1))
                            .withRel("prev").expand()
            );
        }

        return response;
    }

    @PostMapping("/{userId}/bookings/{bookingId}/cancel")
    public ResponseEntity<Void> cancelBooking(@PathVariable String userId, @PathVariable String bookingId){
        bookingService.cancelBooking(userId, bookingId);
        return ResponseEntity.ok().build();
    }
}
