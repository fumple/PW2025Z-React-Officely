package com.officely.backend.modules.admin.controller;

import com.officely.backend.api.pagination.PaginationDto;
import com.officely.backend.entity.OfficeOfferEntity;
import com.officely.backend.entity.UserEntity;
import com.officely.backend.api.PaginatedResponse;
import com.officely.backend.modules.admin.api.officeoffers.AdminOfficeOfferMapper;
import com.officely.backend.modules.admin.api.officeoffers.OfficeOfferDto;
import com.officely.backend.modules.admin.api.officeoffers.OfficeOfferPostRequest;
import com.officely.backend.modules.admin.services.AdminPermissionService;
import com.officely.backend.service.OfficeOfferService;
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
@RequestMapping("/admin/offices/{officeId}/offers")
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class AdminOfficeOffersController {
    private final OfficeService officeService;
    private final OfficeOfferService officeOfferService;
    private final AdminOfficeOfferMapper adminOfficeOfferMapper;
    private final AdminPermissionService adminPermissionService;

    private OfficeOfferDto officeOfferToDto(OfficeOfferEntity item) {
        var e = adminOfficeOfferMapper.officeOfferToOfficeOfferDto(item);
        e.add(
                linkTo(AdminOfficeOffersController.class).slash(e.getId()).withSelfRel(),
                linkTo(AdminOfficesController.class).slash(e.getOfficeId()).withRel("office")
        );
        return e;
    }

    @GetMapping
    public ResponseEntity<PaginatedResponse<OfficeOfferDto>> getOffers(@PathVariable Long officeId, @RequestParam @Valid @Min(1) @Max(50) int pageSize, @RequestParam(required = false) Integer pageToken,
                                                                       @RequestParam(required = false) String search,
                                                                       @RequestParam(required = false) String sortField, @RequestParam(required = false) String sortDirection) {
        var actor = (UserEntity) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        var targetOpt = officeService.getOfficeById(officeId);
        if(targetOpt.isEmpty())
            return ResponseEntity.notFound().build();

        var target = targetOpt.get();
        if(!adminPermissionService.canManageOffice(actor, target)) {
            return ResponseEntity.notFound().build();
        }

        var currentPage = pageToken == null ? 0 : pageToken;
        var pageRequest = PageRequest.of(currentPage, pageSize);

        if(sortField != null && sortDirection != null) {
            pageRequest = pageRequest.withSort(sortDirection.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, sortField);
        }

        var offices = search != null ? officeOfferService.getOffers(officeId, pageRequest, search) : officeOfferService.getOffers(officeId, pageRequest);
        var response = new PaginatedResponse<OfficeOfferDto>();
        response.setResults(offices.get().map(this::officeOfferToDto).toList());

        var pagination = new PaginationDto();
        pagination.setLastPage(offices.getTotalPages() - 1);
        pagination.setCurrentPage(currentPage);
        pagination.setPageSize(pageSize);
        response.setPagination(pagination);

        response.add(
                linkTo(methodOn(AdminOfficeOffersController.class).getOffers(officeId, pageSize, currentPage, search, sortField, sortDirection))
                        .withSelfRel().expand(),
                linkTo(methodOn(AdminOfficeOffersController.class).getOffers(officeId, pageSize, 0, search, sortField, sortDirection))
                        .withRel("first").expand(),
                linkTo(methodOn(AdminOfficeOffersController.class).getOffers(officeId, pageSize, pagination.getLastPage(), search, sortField, sortDirection))
                        .withRel("last").expand()
        );
        if(currentPage != pagination.getLastPage()) {
            response.add(
                    linkTo(methodOn(AdminOfficeOffersController.class).getOffers(officeId, pageSize, currentPage+1, search, sortField, sortDirection))
                            .withRel("next").expand()
            );
        }
        if(currentPage > 0) {
            response.add(
                    linkTo(methodOn(AdminOfficeOffersController.class).getOffers(officeId, pageSize, currentPage-1, search, sortField, sortDirection))
                            .withRel("prev").expand()
            );
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<Void> createOffer(
            @PathVariable Long officeId,
            @RequestBody @Valid OfficeOfferPostRequest request) {
        var actor = (UserEntity) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        var targetOpt = officeService.getOfficeById(officeId);
        if(targetOpt.isEmpty())
            return ResponseEntity.notFound().build();

        var target = targetOpt.get();
        if(!adminPermissionService.canManageOffice(actor, target)) {
            return ResponseEntity.notFound().build();
        }

        var offer = adminOfficeOfferMapper.officeOfferPostRequestToOfficeOffer(request);
        offer.setOffice(target);
        var created = officeOfferService.createOffer(offer, request.getSourceId());
        return ResponseEntity.created(linkTo(methodOn(AdminOfficeOffersController.class).getOffer(officeId, created.getId())).toUri()).build();
    }

    @GetMapping("/{offerId}")
    public ResponseEntity<OfficeOfferDto> getOffer(@PathVariable Long officeId, @PathVariable Long offerId) {
        var actor = (UserEntity) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        var targetOpt = officeService.getOfficeById(officeId);
        if(targetOpt.isEmpty())
            return ResponseEntity.notFound().build();

        var target = targetOpt.get();
        if(!adminPermissionService.canManageOffice(actor, target)) {
            return ResponseEntity.notFound().build();
        }

        var offer = officeOfferService.getOffer(officeId, offerId);
        if(offer == null)
            return ResponseEntity.notFound().build();
        var response = officeOfferToDto(offer);
        return ResponseEntity.ok(response);
    }
}

