package com.officely.backend.modules.mobile.controller.partners.parkly;

import com.officely.backend.entity.UserEntity;
import com.officely.backend.modules.mobile.api.partners.parkly.*;
import com.officely.backend.modules.parkly.ParklyClient;
import com.officely.backend.modules.parkly.api.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@RestController
@RequestMapping("/mobile/partners/parkly")
public class MobileParklyController {
    private final ParklyClient parklyClient;

    public MobileParklyController(ParklyClient parklyClient) {
        this.parklyClient = parklyClient;
    }

    private ParklyParkingDto mapParkingSearchItem(ParkingResponse p, LocalDate startDate, LocalDate endDate) {
        var dto = new ParklyParkingDto();
        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setCity(p.getCity());
        dto.setStreetName(p.getStreetName());
        dto.setStreetNumber(p.getStreetNumber());
        dto.setLatitude(p.getLatitude());
        dto.setLongitude(p.getLongitude());
        dto.setPriceForPeriod(p.getPriceForPeriod());
        dto.setMainImageUrl(p.getMainImageUrl());

        // required by internal-mobile: _links.details
        dto.add(linkTo(methodOn(MobileParklyController.class)
                .getParking(p.getId().toString(), startDate, endDate))
                .withRel("details"));

        return dto;
    }

    private ParklyParkingDetailsDto mapParkingDetails(ParkingDetailsResponse p, LocalDate startDate, LocalDate endDate) {
        var dto = new ParklyParkingDetailsDto();
        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setCountry(p.getCountry());
        dto.setCity(p.getCity());
        dto.setPostalCode(p.getPostalCode());
        dto.setStreetName(p.getStreetName());
        dto.setStreetNumber(p.getStreetNumber());
        dto.setLatitude(p.getLatitude());
        dto.setLongitude(p.getLongitude());
        dto.setPriceForPeriod(p.getPriceForPeriod());
        dto.setImageUrls(p.getImageUrls());
        dto.setDisabled(p.getDisabled());
        dto.setEv(p.getEv());
        dto.setBig(p.getBig());

        dto.add(linkTo(methodOn(MobileParklyController.class)
                .getParking(p.getId().toString(), startDate, endDate))
                .withSelfRel());

        return dto;
    }

    private ParklyBookingDto mapBookingWithLinks(BookingResponse b) {
        var dto = new ParklyBookingDto();
        dto.setId(b.getId());
        dto.setSpotId(b.getSpotId());
        dto.setParkingName(b.getParkingName());
        dto.setStreet(b.getStreet());
        dto.setCity(b.getCity());
        dto.setImageUrl(b.getImageUrl());

        // IMPORTANT: internal-mobile response uses start/end (NOT startDate/endDate)
        dto.setStart(b.getStart());
        dto.setEnd(b.getEnd());

        dto.setLocalId(b.getLocalId());
        dto.setTotalCost(b.getTotalCost());
        dto.setStatus(b.getStatus());
        dto.setSource(b.getSource());
        dto.setDisabled(b.getDisabled());
        dto.setEv(b.getEv());
        dto.setBig(b.getBig());

        // required: _links.self
        dto.add(linkTo(methodOn(MobileParklyController.class).getBooking(b.getId().toString()))
                .withSelfRel());

        //noinspection DataFlowIssue
        dto.add(linkTo(methodOn(MobileParklyController.class)
                .editBooking(b.getId().toString(), null))
                .withRel("update"));

        // optional but useful
        dto.add(linkTo(methodOn(MobileParklyController.class).cancelBooking(b.getId().toString()))
                .withRel("cancel"));

        return dto;
    }

    private ParklyBookingPostResponseDto mapCreateBookingResponse(CreateBookingResponse r) {
        var dto = new ParklyBookingPostResponseDto();
        dto.setId(r.getId());
        dto.setLocalId(r.getLocalId());
        dto.setStart(r.getStart());
        dto.setEnd(r.getEnd());
        dto.setTotalCost(r.getTotalCost());
        dto.setStatus(r.getStatus());
        dto.setDisabled(r.getDisabled());
        dto.setEv(r.getEv());
        dto.setBig(r.getBig());
        return dto;
    }

    private ParklyBookingResourceDto mapBookingResource(BookingResponse b) {
        var dto = new ParklyBookingResourceDto();
        dto.setId(b.getId());
        dto.setSpotId(b.getSpotId());
        dto.setParkingName(b.getParkingName());
        dto.setStreet(b.getStreet());
        dto.setCity(b.getCity());
        dto.setImageUrl(b.getImageUrl());
        dto.setLocalId(b.getLocalId());
        dto.setStart(b.getStart());
        dto.setEnd(b.getEnd());
        dto.setTotalCost(b.getTotalCost());
        dto.setStatus(b.getStatus());
        dto.setSource(b.getSource());
        dto.setDisabled(b.getDisabled());
        dto.setEv(b.getEv());
        dto.setBig(b.getBig());
        return dto;
    }

    public enum SortField {
        DISTANCE,
        PRICE
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
            @RequestParam(required = false) Boolean isBig,
            @RequestParam(required = false) SortField sort,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String city
    ) {
        var resp = parklyClient.getAllParkings(
                nearLat, nearLon,
                maxDistanceFromAddress == null ? null : maxDistanceFromAddress.doubleValue(),
                startDate.atStartOfDay(), endDate.atTime(23, 59, 59),
                isEv, isDisabled, isBig,
                name, city, sort == SortField.PRICE, sort == SortField.DISTANCE
        );

        if (!resp.getStatusCode().is2xxSuccessful()) {
            return resp;
        }

        @SuppressWarnings("unchecked")
        var partnerList = (List<ParkingResponse>) resp.getBody();

        var out = new ParklyParkingSearchResponseDto();
        out.setResults(partnerList.stream()
                .map(p -> mapParkingSearchItem(p, startDate, endDate))
                .toList());

        out.add(linkTo(methodOn(MobileParklyController.class)
                .listParkings(nearLat, nearLon, maxDistanceFromAddress, startDate, endDate, isEv, isDisabled, isBig, sort, name, city))
                .withSelfRel()
                .expand());

        return ResponseEntity.ok(out);
    }

    @GetMapping("/parkings/{parkingId}")
    public ResponseEntity<?> getParking(
            @PathVariable String parkingId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        var resp = parklyClient.getParkingDetails(parkingId, startDate.atStartOfDay(), endDate.atTime(23, 59, 59));
        if (!resp.getStatusCode().is2xxSuccessful()) {
            return resp;
        }

        var partner = (ParkingDetailsResponse) resp.getBody();
        return ResponseEntity.ok(mapParkingDetails(partner, startDate, endDate));
    }

    @GetMapping("/bookings")
    public ResponseEntity<?> myBookings(
            @RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to
    ) {
        var actor = (UserEntity) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        var resp = parklyClient.getMyBookings(actor.getEmail(), from, to);

        if (!resp.getStatusCode().is2xxSuccessful()) {
            return resp;
        }

        @SuppressWarnings("unchecked")
        var partnerList = (List<BookingResponse>) resp.getBody();

        var out = partnerList.stream()
                .map(this::mapBookingWithLinks)
                .toList();

        return ResponseEntity.ok(out);
    }

    @PostMapping("/bookings")
    public ResponseEntity<?> createBooking(@RequestBody ParklyBookingPostRequest req) {
        var actor = (UserEntity) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        var partnerReq = new CreateBookingRequest();
        partnerReq.setName(actor.getFirstName());
        partnerReq.setSurname(actor.getLastName());
        partnerReq.setPhoneNumber(actor.getPhoneNumber());

        // internal -> partner mapping
        partnerReq.setParkingId(req.getParkingId());
        partnerReq.setStart(req.getStartDate().atStartOfDay());
        partnerReq.setEnd(req.getEndDate().atTime(23, 59, 59));

        // flags
        partnerReq.setDisabled(req.getDisabled());
        partnerReq.setEv(req.getEv());
        partnerReq.setBig(req.getBig());

        var resp = parklyClient.createBooking(actor.getEmail(), partnerReq);

        if (!resp.getStatusCode().is2xxSuccessful()) {
            return resp;
        }

        var partner = (CreateBookingResponse) resp.getBody();
        return ResponseEntity.status(resp.getStatusCode()).body(mapCreateBookingResponse(partner));
    }

    @GetMapping("/bookings/{id}")
    public ResponseEntity<?> getBooking(@PathVariable String id) {
        var actor = (UserEntity) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        var resp = parklyClient.getBookingById(actor.getEmail(), id);

        if (!resp.getStatusCode().is2xxSuccessful()) {
            return resp;
        }

        var partner = (BookingResponse) resp.getBody();
        return ResponseEntity.ok(mapBookingWithLinks(partner));
    }

    @PatchMapping("/bookings/{id}")
    public ResponseEntity<?> editBooking(@PathVariable String id, @RequestBody ParklyBookingPatchRequest req) {
        var actor = (UserEntity) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        var partnerReq = new EditBookingRequest();
        partnerReq.setStart(req.getStart().atStartOfDay());
        partnerReq.setEnd(req.getEnd().atTime(23, 59, 59));

        partnerReq.setConfirmed(req.getConfirmed());

        var resp = parklyClient.editBooking(actor.getEmail(), id, partnerReq);

        if (!resp.getStatusCode().is2xxSuccessful()) {
            return resp;
        }

        var partner = (BookingResponse) resp.getBody();
        return ResponseEntity.ok(mapBookingResource(partner));
    }

    @DeleteMapping("/bookings/{id}")
    public ResponseEntity<?> cancelBooking(@PathVariable String id) {
        var actor = (UserEntity) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        var resp = parklyClient.cancelBooking(actor.getEmail(), id);
        if (!resp.getStatusCode().is2xxSuccessful()) return resp;
        return ResponseEntity.noContent().build();
    }
}