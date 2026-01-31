package com.officely.backend.modules.mobile.controller;

import com.officely.backend.api.CreatedResponse;
import com.officely.backend.api.pagination.PaginationDto;
import com.officely.backend.entity.OfficeEntity;
import com.officely.backend.entity.OfficeItemEntity;
import com.officely.backend.entity.OfficeOfferEntity;
import com.officely.backend.entity.UserEntity;
import com.officely.backend.modules.flatly.api.offices.dto.*;
import com.officely.backend.modules.flatly.api.offices.mapper.OfficeItemMapper;
import com.officely.backend.modules.flatly.api.offices.mapper.OfficeMapper;
import com.officely.backend.modules.flatly.api.offices.mapper.OfficeOfferMapper;
import com.officely.backend.modules.flatly.api.offices.mapper.OfficeOfferWithoutPriceMapper;
import com.officely.backend.service.BookingService;
import com.officely.backend.service.OfficeItemService;
import com.officely.backend.service.OfficeOfferService;
import com.officely.backend.service.OfficeService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@RestController
@RequestMapping("/mobile/offices")
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class MobileOfficesController {
    private final OfficeService officeService;
    private final BookingService bookingService;
    private final OfficeItemService officeItemService;
    private final OfficeOfferService officeOfferService;

    private OfficeDto toDto(OfficeEntity entity) {
        var dto = OfficeMapper.toDto(entity);
        dto.add(linkTo(methodOn(MobileOfficesController.class).getOffice(entity.getId())).withSelfRel());
        return dto;
    }

    private OfficeOfferDto toDto(OfficeService.OfficeOffer offer, LocalDate startDate, LocalDate endDate) {
        var dto = OfficeOfferMapper.toDto(offer.getEntity(), offer.getTotalPrice());
        dto.add(linkTo(methodOn(MobileOfficesController.class)
                .bookOfficeUsingOffer(offer.getEntity().getOffice().getId(), offer.getEntity().getId(), startDate, endDate))
                .withRel("accept")
                .expand());
        return dto;
    }

    private OfficeItemDto toDto(OfficeItemEntity entity) {
        var dto = OfficeItemMapper.toDto(entity);
        dto.add(linkTo(methodOn(MobileOfficesController.class).getOfficeItemDetails(entity.getOffice().getId(), entity.getId())).withSelfRel());
        return dto;
    }

    private OfficeOfferWithoutPriceDto toDto(OfficeOfferEntity entity) {
        var dto = OfficeOfferWithoutPriceMapper.toDto(entity);
        dto.add(linkTo(methodOn(MobileOfficesController.class).getOfficeOfferDetails(entity.getOffice().getId(), entity.getId())).withSelfRel());
        return dto;
    }

    private OfficeSearchResultDto toDto(OfficeService.OfficeWithDistance entity, LocalDate startDate, LocalDate endDate, Integer minPrice, Integer maxPrice, List<String> filter) {
        var dto = OfficeMapper.toDto(entity);
        dto.add(linkTo(methodOn(MobileOfficesController.class).getOfficeOffers(entity.getOffice().getId(), startDate, endDate, minPrice, maxPrice, filter)).withRel("offers").expand());
        return dto;
    }

    @GetMapping
    public OfficeSearchResponseDto searchOffices(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Double nearLat,
            @RequestParam(required = false) Double nearLon,
            @RequestParam String nearAddress,
            @RequestParam(required = false) Integer maxDistanceFromAddress,
            @RequestParam(required = false) Integer minPrice,
            @RequestParam(required = false) Integer maxPrice,
            @RequestParam(required = false) List<String> filter,
            @RequestParam(required = false, defaultValue = "distance") String sort,
            @RequestParam int pageSize,
            @RequestParam(required = false) String pageToken
    ) {
        Integer pageTokenInt = null;
        try {
            if (pageToken != null && !pageToken.isBlank()) {
                pageTokenInt = Integer.parseInt(pageToken);
            }
        } catch (NumberFormatException ex) {
            pageTokenInt = null;
        }


        var search = officeService.searchOffices(
                startDate, endDate, nearLat, nearLon, nearAddress,
                maxDistanceFromAddress, minPrice, maxPrice, filter, sort, pageSize, pageTokenInt
        );

        var response = new OfficeSearchResponseDto();

        var pagination = new PaginationDto();
        pagination.setCurrentPage(search.getCurrentPage());
        pagination.setLastPage(search.getLastPage());
        pagination.setPageSize(search.getPageSize());
        response.setPagination(pagination);

        response.setQuery(new OfficeSearchResponseDto.Query(search.getMinPrice(), search.getMaxPrice()));
        response.setResults(search.getOffices().stream().map(e -> toDto(e, startDate, endDate, minPrice, maxPrice, filter)).toList());

        response.add(
                linkTo(methodOn(MobileOfficesController.class)
                        .searchOffices(startDate, endDate, nearLat, nearLon, nearAddress, maxDistanceFromAddress, minPrice, maxPrice, filter, sort, pageSize, String.valueOf(pagination.getCurrentPage())))
                        .withSelfRel().expand(),
                linkTo(methodOn(MobileOfficesController.class)
                        .searchOffices(startDate, endDate, nearLat, nearLon, nearAddress, maxDistanceFromAddress, minPrice, maxPrice, filter, sort, pageSize, "0"))
                        .withRel("first").expand(),
                linkTo(methodOn(MobileOfficesController.class)
                        .searchOffices(startDate, endDate, nearLat, nearLon, nearAddress, maxDistanceFromAddress, minPrice, maxPrice, filter, sort, pageSize, String.valueOf(pagination.getLastPage())))
                        .withRel("last").expand()
        );

        if (pagination.getCurrentPage() != pagination.getLastPage()) {
            response.add(
                    linkTo(methodOn(MobileOfficesController.class)
                            .searchOffices(startDate, endDate, nearLat, nearLon, nearAddress, maxDistanceFromAddress, minPrice, maxPrice, filter, sort, pageSize, String.valueOf(pagination.getCurrentPage() + 1)))
                            .withRel("next").expand()
            );
        }
        if (pagination.getCurrentPage() > 0) {
            response.add(
                    linkTo(methodOn(MobileOfficesController.class)
                            .searchOffices(startDate, endDate, nearLat, nearLon, nearAddress, maxDistanceFromAddress, minPrice, maxPrice, filter, sort, pageSize, String.valueOf(pagination.getCurrentPage() - 1)))
                            .withRel("prev").expand()
            );
        }

        return response;
    }

    @GetMapping("/{officeId}")
    public ResponseEntity<OfficeDto> getOffice(@PathVariable long officeId) {
        var office = officeService.getOfficeById(officeId);
        return office
                .map(officeEntity -> ResponseEntity.ok(toDto(officeEntity)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{officeId}/offers")
    public ResponseEntity<OfficeOffersResponseDto> getOfficeOffers(
            @PathVariable long officeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Integer minPrice,
            @RequestParam(required = false) Integer maxPrice,
            @RequestParam(required = false) List<String> filter
    ) {
        var offers = officeService.getOfficeOffers(officeId, startDate, endDate, minPrice, maxPrice, filter);
        if(offers == null) {
            return ResponseEntity.notFound().build();
        }
        var response = new OfficeOffersResponseDto();
        response.setOffers(offers.stream().map(e -> toDto(e, startDate, endDate)).toList());
        response.add(linkTo(methodOn(MobileOfficesController.class).getOfficeOffers(officeId, startDate, endDate, minPrice, maxPrice, filter)).withSelfRel().expand());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{officeId}/items/{itemId}")
    public ResponseEntity<OfficeItemDto> getOfficeItemDetails(@PathVariable Long officeId, @PathVariable Long itemId) {
        return officeItemService.getOfficeItem(officeId, itemId)
                .map(entity -> ResponseEntity.ok(toDto(entity)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }


    @GetMapping("/{officeId}/offers/{offerId}")
    public ResponseEntity<OfficeOfferWithoutPriceDto> getOfficeOfferDetails(@PathVariable Long officeId, @PathVariable Long offerId) {
        return officeOfferService.getOffer(officeId, offerId)
                .map(entity -> ResponseEntity.ok(toDto(entity)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }


    @PostMapping("/{officeId}/offers/{offerId}/book")
    public ResponseEntity<CreatedResponse> bookOfficeUsingOffer(
            @PathVariable long officeId,
            @PathVariable long offerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        var actor = (UserEntity) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        var userId = actor.getId();

        try {
            Long bookingId = bookingService.bookOfficeUsingOffer(officeId, offerId, userId, startDate, endDate);

            return ResponseEntity.created(linkTo(methodOn(MobileBookingsController.class).getBooking(bookingId)).toUri())
                    .body(new CreatedResponse(bookingId.toString()));
        } catch(NoSuchElementException ex) {
            return ResponseEntity.notFound().build();
        }
    }
}
