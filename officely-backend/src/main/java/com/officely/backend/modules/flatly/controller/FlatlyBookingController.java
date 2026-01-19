package com.officely.backend.modules.flatly.controller;

import com.officely.backend.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/flatly/bookings")
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class FlatlyBookingController {
    private final BookingService bookingService;
}
