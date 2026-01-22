package com.officely.backend.modules.flatly.controller;

import com.officely.backend.modules.flatly.api.offices.dto.*;
import com.officely.backend.modules.flatly.api.offices.mapper.OfficeItemMapper;
import com.officely.backend.modules.flatly.api.offices.mapper.OfficeOfferWithoutPriceMapper;
import com.officely.backend.service.BookingService;
import com.officely.backend.service.OfficeItemService;
import com.officely.backend.service.OfficeOfferService;
import com.officely.backend.service.OfficeService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/flatly/offices")
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class FlatlyOfficesController {
    private final OfficeService officeService;
    private final BookingService bookingService;
    private final OfficeItemService officeItemService;
    private final OfficeOfferService officeOfferService;

    @GetMapping
    public OfficeSearchResponseDto searchOffices(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam String nearAddress,
            @RequestParam(required=false) Integer maxDistanceFromAddress,
            @RequestParam(required = false) List<String> filter,
            @RequestParam(required = false, defaultValue = "distance") String sort,
            @RequestParam Integer pageSize,
            @RequestParam(required = false) String pageToken
    ){
        return officeService.searchOffices(startDate, endDate, nearAddress, maxDistanceFromAddress, filter, sort, pageSize, pageToken);
    }

    @GetMapping("/{officeId}")
    public OfficeDto getOffice(@PathVariable String officeId){
        return officeService.getOfficeById(officeId);
    }

    @GetMapping("/{officeId}/offers")
    public OfficeOffersResponseDto getOfficeOffers(
            @PathVariable String officeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) List<String> filter
    ) {
        return officeService.getOfficeOffers(officeId, startDate, endDate, filter);
    }

    @PostMapping("/{officeId}/offers/{offerId}/book")
    public ResponseEntity<Void> bookOfficeUsingOffer(
            @PathVariable String officeId,
            @PathVariable String offerId,
            @RequestParam String userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        Long bookingId = bookingService.bookOfficeUsingOffer(officeId, offerId, userId, startDate, endDate);

        URI location = URI.create("/users/" + userId + "/bookings/" + bookingId);
        return ResponseEntity.created(location).build();
    }

    @GetMapping("/{officeId}/items/{itemId}")
    public OfficeItemDto getOfficeItemDetails(@PathVariable Long officeId, @PathVariable Long itemId) {
        return OfficeItemMapper.toDto(officeId, officeItemService.getOfficeItem(officeId, itemId));
    }

    @GetMapping("/{officeId}/offers/{offerId}")
    public OfficeOfferWithoutPriceDto getOfficeOfferDetails(@PathVariable Long officeId, @PathVariable Long offerId){
        return OfficeOfferWithoutPriceMapper.toDto(officeOfferService.getOffer(officeId, offerId));
    }
}
