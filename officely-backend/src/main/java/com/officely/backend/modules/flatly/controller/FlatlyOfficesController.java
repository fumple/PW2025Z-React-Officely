package com.officely.backend.modules.flatly.controller;

import com.officely.backend.api.CreatedResponse;
import com.officely.backend.api.pagination.PaginationDto;
import com.officely.backend.entity.OfficeEntity;
import com.officely.backend.entity.OfficeItemEntity;
import com.officely.backend.entity.OfficeOfferEntity;
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
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@RestController
@RequestMapping("/flatly/offices")
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class FlatlyOfficesController {
    private final OfficeService officeService;
    private final BookingService bookingService;
    private final OfficeItemService officeItemService;
    private final OfficeOfferService officeOfferService;

    private OfficeDto toDto(OfficeEntity entity) {
        var dto = OfficeMapper.toDto(entity);
        dto.add(linkTo(methodOn(FlatlyOfficesController.class).getOffice(entity.getId())).withSelfRel());
        return dto;
    }
    private OfficeOfferDto toDto(OfficeService.OfficeOffer offer, LocalDate startDate, LocalDate endDate) {
        var dto = OfficeOfferMapper.toDto(offer.getEntity(), offer.getTotalPrice());
        dto.add(linkTo(methodOn(FlatlyOfficesController.class)
                .bookOfficeUsingOffer(offer.getEntity().getOffice().getId(), offer.getEntity().getId(), null, startDate, endDate))
                .withRel("accept")
                .expand());
        return dto;
    }
    private OfficeItemDto toDto(OfficeItemEntity entity) {
        var dto = OfficeItemMapper.toDto(entity);
        dto.add(linkTo(methodOn(FlatlyOfficesController.class).getOfficeItemDetails(entity.getOffice().getId(), entity.getId())).withSelfRel());
        return dto;
    }
    private OfficeOfferWithoutPriceDto toDto(OfficeOfferEntity entity) {
        var dto = OfficeOfferWithoutPriceMapper.toDto(entity);
        dto.add(linkTo(methodOn(FlatlyOfficesController.class).getOfficeOfferDetails(entity.getOffice().getId(), entity.getId())).withSelfRel());
        return dto;
    }
    private OfficeSearchResultDto toDto(OfficeService.OfficeWithDistance entity, LocalDate startDate, LocalDate endDate, Integer minPrice, Integer maxPrice, List<String> filter) {
        var dto = OfficeMapper.toDto(entity);
        dto.add(linkTo(methodOn(FlatlyOfficesController.class).getOfficeOffers(entity.getOffice().getId(), startDate, endDate, minPrice, maxPrice, filter)).withRel("offers").expand());
        return dto;
    }

    @GetMapping
    public OfficeSearchResponseDto searchOffices(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required=false) Double nearLat,
            @RequestParam(required=false) Double nearLon,
            @RequestParam String nearAddress,
            @RequestParam(required=false) Integer maxDistanceFromAddress,
            @RequestParam(required = false) Integer minPrice,
            @RequestParam(required = false) Integer maxPrice,
            @RequestParam(required = false) List<String> filter,
            @RequestParam(required = false, defaultValue = "distance") String sort,
            @RequestParam int pageSize,
            @RequestParam(required = false) Integer pageToken
    ){
        var search = officeService.searchOffices(startDate, endDate, nearLat, nearLon, nearAddress, maxDistanceFromAddress, minPrice, maxPrice, filter, sort, pageSize, pageToken);

        var response = new OfficeSearchResponseDto();
        var pagination = new PaginationDto();
        pagination.setCurrentPage(search.getCurrentPage());
        pagination.setLastPage(search.getLastPage());
        pagination.setPageSize(search.getPageSize());
        response.setPagination(pagination);
        response.setQuery(new OfficeSearchResponseDto.Query(search.getMinPrice(), search.getMaxPrice()));
        response.setResults(search.getOffices().stream().map(e -> toDto(e, startDate, endDate, minPrice, maxPrice, filter)).toList());

        response.add(
                linkTo(methodOn(FlatlyOfficesController.class).searchOffices(startDate, endDate, nearLat, nearLon, nearAddress, maxDistanceFromAddress, minPrice, maxPrice, filter, sort, pageSize, pagination.getCurrentPage()))
                        .withSelfRel().expand(),
                linkTo(methodOn(FlatlyOfficesController.class).searchOffices(startDate, endDate, nearLat, nearLon, nearAddress, maxDistanceFromAddress, minPrice, maxPrice, filter, sort, pageSize, 0))
                        .withRel("first").expand(),
                linkTo(methodOn(FlatlyOfficesController.class).searchOffices(startDate, endDate, nearLat, nearLon, nearAddress, maxDistanceFromAddress, minPrice, maxPrice, filter, sort, pageSize, pagination.getLastPage()))
                        .withRel("last").expand()
        );
        if(pagination.getCurrentPage() != pagination.getLastPage()) {
            response.add(
                    linkTo(methodOn(FlatlyOfficesController.class).searchOffices(startDate, endDate, nearLat, nearLon, nearAddress, maxDistanceFromAddress, minPrice, maxPrice, filter, sort, pageSize, pagination.getCurrentPage()+1))
                            .withRel("next").expand()
            );
        }
        if(pagination.getCurrentPage() > 0) {
            response.add(
                    linkTo(methodOn(FlatlyOfficesController.class).searchOffices(startDate, endDate, nearLat, nearLon, nearAddress, maxDistanceFromAddress, minPrice, maxPrice, filter, sort, pageSize, pagination.getCurrentPage()-1))
                            .withRel("prev").expand()
            );
        }

        return response;
    }

    @GetMapping("/{officeId}")
    public ResponseEntity<OfficeDto> getOffice(@PathVariable long officeId){
        var office = officeService.getOfficeById(officeId);
        return office
                .map(officeEntity -> ResponseEntity.ok(toDto(officeEntity)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{officeId}/offers")
    public OfficeOffersResponseDto getOfficeOffers(
            @PathVariable long officeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Integer minPrice,
            @RequestParam(required = false) Integer maxPrice,
            @RequestParam(required = false) List<String> filter
    ) {
        var offers = officeService.getOfficeOffers(officeId, startDate, endDate, minPrice, maxPrice, filter);
        var response = new OfficeOffersResponseDto();
        response.setOffers(offers.stream().map(e -> toDto(e, startDate, endDate)).toList());
        response.add(linkTo(methodOn(FlatlyOfficesController.class).getOfficeOffers(officeId, startDate, endDate, minPrice, maxPrice, filter)).withSelfRel().expand());
        return response;
    }

    @PostMapping("/{officeId}/offers/{offerId}/book")
    public ResponseEntity<CreatedResponse> bookOfficeUsingOffer(
            @PathVariable long officeId,
            @PathVariable long offerId,
            @SuppressWarnings("DataFlowIssue") @RequestParam Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        if(userId == null) {
            throw new RuntimeException("Shouldn't be possible");
        }
        Long bookingId = bookingService.bookOfficeUsingOffer(officeId, offerId, userId, startDate, endDate);

        return ResponseEntity.created(linkTo(methodOn(FlatlyUserController.class).getUsersBookingInfo(userId, bookingId)).toUri())
                .body(new CreatedResponse(bookingId.toString()));
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
}
