package com.officely.backend.modules.mobile.controller.partners.parkly;

import com.officely.backend.entity.UserEntity;
import com.officely.backend.modules.mobile.api.partners.parkly.ParklyBookingPatchRequest;
import com.officely.backend.modules.mobile.api.partners.parkly.ParklyBookingPostRequest;
import com.officely.backend.modules.parkly.ParklyClient;
import com.officely.backend.modules.parkly.api.CreateBookingRequest;
import com.officely.backend.modules.parkly.api.EditBookingRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/mobile/partners/parkly")
public class MobileParklyController {
    private final ParklyClient parklyClient;

    public MobileParklyController(ParklyClient parklyClient) {
        this.parklyClient = parklyClient;
    }

    @GetMapping("/parkings")
    public ResponseEntity<?> listParkings(
            @RequestParam(name = "nearLat") double nearLat,
            @RequestParam(name = "nearLon") double nearLon,
            @RequestParam(name = "maxDistanceFromAddress", required = false) Integer maxDistanceFromAddress,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Boolean isEv,
            @RequestParam(required = false) Boolean isDisabled,
            @RequestParam(required = false) Boolean isBig
    ) {
        return parklyClient.getAllParkings(
                nearLat, nearLon,
                maxDistanceFromAddress == null ? null : maxDistanceFromAddress.doubleValue(),
                startDate.toString(), endDate.toString(),
                isEv, isDisabled, isBig
        );
    }

    @GetMapping("/parkings/{parkingId}")
    public ResponseEntity<?> getParking(
            @PathVariable String parkingId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return parklyClient.getParkingDetails(parkingId, startDate.toString(), endDate.toString());
    }

    @GetMapping("/bookings")
    public ResponseEntity<?> myBookings(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to
    ) {
        var actor = (UserEntity) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return parklyClient.getMyBookings(actor.getId().toString(), actor.getEmail(), from, to);
    }

    @PostMapping("/bookings")
    public ResponseEntity<?> createBooking(@RequestBody ParklyBookingPostRequest req) {
        var actor = (UserEntity) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        var partnerReq = new CreateBookingRequest();
        partnerReq.setSource("officely");
        partnerReq.setEmail(actor.getEmail());

        // internal -> partner mapping
        partnerReq.setParkingId(req.getParkingId());
        partnerReq.setStart(req.getStartDate());
        partnerReq.setEnd(req.getEndDate());

        // flags (support both naming variants on partner side if you added them)
        partnerReq.setDisabled(req.getDisabled());
        partnerReq.setEv(req.getEv());
        partnerReq.setBig(req.getBig());
        partnerReq.setIs_disabled(req.getDisabled());
        partnerReq.setIs_ev(req.getEv());
        partnerReq.setIs_big(req.getBig());

        return parklyClient.createBooking(actor.getId().toString(), partnerReq);
    }

    @GetMapping("/bookings/{id}")
    public ResponseEntity<?> getBooking(@PathVariable String id) {
        var actor = (UserEntity) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return parklyClient.getBookingById(actor.getId().toString(), actor.getEmail(), id);
    }

    @PatchMapping("/bookings/{id}")
    public ResponseEntity<?> editBooking(@PathVariable String id, @RequestBody ParklyBookingPatchRequest req) {
        var actor = (UserEntity) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        var partnerReq = new EditBookingRequest();
        partnerReq.setEmail(actor.getEmail());
        partnerReq.setStart(req.getStart());
        partnerReq.setEnd(req.getEnd());

        partnerReq.setConfirmed(req.getConfirmed());
        partnerReq.setIs_confirmed(req.getConfirmed());

        return parklyClient.editBooking(actor.getId().toString(), id, partnerReq);
    }

    @DeleteMapping("/bookings/{id}")
    public ResponseEntity<?> cancelBooking(@PathVariable String id) {
        var actor = (UserEntity) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return parklyClient.cancelBooking(actor.getId().toString(), actor.getEmail(), id);
    }
}