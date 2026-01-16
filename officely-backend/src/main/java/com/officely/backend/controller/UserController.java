package com.officely.backend.controller;

import com.officely.backend.api.bookings.dto.BookingDto;
import com.officely.backend.api.bookings.dto.BookingsResponseDto;
import com.officely.backend.api.users.dto.*;
import com.officely.backend.service.BookingService;
import com.officely.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {
    private final UserService userService;
    private final BookingService bookingService;

    public UserController(UserService userService, BookingService bookingService) {
        this.userService = userService;
        this.bookingService = bookingService;
    }

    @GetMapping
    public UsersResponseDto getUserByEmail(@RequestParam String email) {
        UsersResponseDto response = new UsersResponseDto();
        List<UserDto> users = userService.findByEmail(email);
        response.setUsers(users);

        UsersResponseDto.Links links = new UsersResponseDto.Links();
        links.setCreate("/users");
        response.setLinks(links);

        return response;
    }

    @PostMapping
    public ResponseEntity<CreateUserResponseDto> createUser(@RequestBody CreateUserRequestDto request) {
        CreateUserResponseDto created = userService.createUser(request);
        return ResponseEntity.created(URI.create("/users/" + created.getId())).build();
    }

    @PatchMapping("/{userId}")
    public ResponseEntity<Void> patchUser(@PathVariable String userId, @RequestBody PatchUserRequestDto request){
        userService.patchUser(userId, request);
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
