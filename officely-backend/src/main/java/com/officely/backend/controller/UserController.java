package com.officely.backend.controller;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;

import com.officely.backend.api.bookings.dto.BookingDto;
import com.officely.backend.api.bookings.dto.BookingsResponseDto;
import com.officely.backend.api.users.dto.*;
import com.officely.backend.api.users.mapper.UserMapper;
import com.officely.backend.entity.UserType;
import com.officely.backend.service.BookingService;
import com.officely.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class UserController {
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
                    linkTo(UserController.class).slash(user.getId()).withSelfRel(),
                    linkTo(UserController.class).slash(user.getId()).withRel("update"),
                    linkTo(UserController.class).slash(user.getId())
                            .slash("bookings").withRel("bookings")
            );

            response.setUsers(List.of(user));
        } else {
            response.setUsers(List.of());
        }

        response.add(linkTo(UserController.class).withRel("create"));
        return response;
    }

    @PostMapping
    public ResponseEntity<Void> createUser(@RequestBody @Valid CreateUserRequestDto request) {
        var user = userMapper.createRequestToUser(request);
        user.setType(UserType.FLATLY_CUSTOMER);
        var created = userService.createUser(user);
        return ResponseEntity.created(linkTo(UserController.class).slash(created.getId()).toUri()).build();
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

    @GetMapping("/{userId}/bookings/{bookingId}")
    public BookingDto getUsersBookingInfo(@PathVariable String userId, @PathVariable String bookingId){
        return bookingService.getBookingInfo(userId, bookingId);
    }

    @GetMapping("/{userId}/bookings")
    public BookingsResponseDto getUsersBookings(@PathVariable String userId, @RequestParam Integer pageSize,
                                                @RequestParam(required = false) String pageToken){
        return bookingService.getUserBookings(userId, pageSize, pageToken);
    }

    @PostMapping("/{userId}/bookings/{bookingId}/cancel")
    public ResponseEntity<Void> cancelBooking(@PathVariable String userId, @PathVariable String bookingId){
        bookingService.cancelBooking(userId, bookingId);
        return ResponseEntity.ok().build();
    }
}
