package com.officely.backend.modules.admin.controller;

import com.officely.backend.api.CreatedResponse;
import com.officely.backend.api.pagination.PaginationDto;
import com.officely.backend.api.throwables.ValidationException;
import com.officely.backend.entity.OfficeItemEntity;
import com.officely.backend.entity.UserEntity;
import com.officely.backend.api.PaginatedResponse;
import com.officely.backend.modules.admin.api.officeitems.AdminOfficeItemMapper;
import com.officely.backend.modules.admin.api.officeitems.OfficeItemDto;
import com.officely.backend.modules.admin.api.officeitems.OfficeItemPatchRequest;
import com.officely.backend.modules.admin.api.officeitems.OfficeItemPostRequest;
import com.officely.backend.modules.admin.services.AdminPermissionService;
import com.officely.backend.service.OfficeItemService;
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
@RequestMapping("/admin/offices/{officeId}/items")
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class AdminOfficeItemsController {
    private final OfficeItemService officeItemService;
    private final AdminPermissionService adminPermissionService;
    private final OfficeService officeService;
    private final AdminOfficeItemMapper adminOfficeItemMapper;
    private final OfficeOfferService officeOfferService;

    private OfficeItemDto officeItemToDto(OfficeItemEntity item) {
        var e = adminOfficeItemMapper.officeItemToOfficeItemDto(item);
        e.add(
                linkTo(methodOn(AdminOfficeItemsController.class).getItem(item.getOffice().getId(), item.getId())).withSelfRel(),
                linkTo(methodOn(AdminOfficeItemsController.class).getItem(item.getOffice().getId(), item.getId())).withRel("update"),
                linkTo(methodOn(AdminOfficesController.class).getOffice(item.getOffice().getId())).withRel("office"),
                linkTo(methodOn(AdminOfficeOffersController.class).getOffer(item.getOffice().getId(), item.getOffer().getId())).withRel("offer")
        );
        return e;
    }

    @GetMapping
    public ResponseEntity<PaginatedResponse<OfficeItemDto>> getItems(@PathVariable Long officeId, @RequestParam @Valid @Min(1) @Max(50) int pageSize, @RequestParam(required = false) Integer pageToken,
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

        var items = search != null ? officeItemService.getItems(officeId, pageRequest, search) : officeItemService.getItems(officeId, pageRequest);
        var response = new PaginatedResponse<OfficeItemDto>();
        response.setResults(items.get().map(this::officeItemToDto).toList());

        var pagination = new PaginationDto();
        pagination.setLastPage(Math.max(items.getTotalPages() - 1, 0));
        pagination.setCurrentPage(currentPage);
        pagination.setPageSize(pageSize);
        response.setPagination(pagination);

        response.add(
                linkTo(methodOn(AdminOfficeItemsController.class).getItems(officeId, pageSize, currentPage, search, sortField, sortDirection))
                        .withSelfRel().expand(),
                linkTo(methodOn(AdminOfficeItemsController.class).getItems(officeId, pageSize, 0, search, sortField, sortDirection))
                        .withRel("first").expand(),
                linkTo(methodOn(AdminOfficeItemsController.class).getItems(officeId, pageSize, pagination.getLastPage(), search, sortField, sortDirection))
                        .withRel("last").expand()
        );
        if(currentPage != pagination.getLastPage()) {
            response.add(
                    linkTo(methodOn(AdminOfficeItemsController.class).getItems(officeId, pageSize, currentPage+1, search, sortField, sortDirection))
                            .withRel("next").expand()
            );
        }
        if(currentPage > 0) {
            response.add(
                    linkTo(methodOn(AdminOfficeItemsController.class).getItems(officeId, pageSize, currentPage-1, search, sortField, sortDirection))
                            .withRel("prev").expand()
            );
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping()
    public ResponseEntity<CreatedResponse> createItem(
            @PathVariable Long officeId,
            @RequestBody @Valid OfficeItemPostRequest request) {
        var actor = (UserEntity) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        var targetOpt = officeService.getOfficeById(officeId);
        if(targetOpt.isEmpty())
            return ResponseEntity.notFound().build();

        var target = targetOpt.get();
        if(!adminPermissionService.canManageOffice(actor, target)) {
            return ResponseEntity.notFound().build();
        }

        var item = adminOfficeItemMapper.officeItemPostRequestToOfficeItem(request);
        item.setOffice(target);
        if(item.getType() == OfficeItemEntity.Types.SHARED && request.getCapacity() == null)
            throw new ValidationException("capacity", "Capacity must be provided when type is set to SHARED");

        var offer = officeOfferService.getOffer(officeId, request.getOfferId());
        if(offer == null)
            throw new ValidationException("offerId", "Offer not found");
        item.setOffer(offer);

        var created = officeItemService.createOfficeItem(item);
        return ResponseEntity.created(linkTo(methodOn(AdminOfficeItemsController.class).getItem(officeId, created.getId())).toUri()).body(new CreatedResponse(item.getId().toString()));
    }

    @GetMapping("/{itemId}")
    public ResponseEntity<OfficeItemDto> getItem(@PathVariable Long officeId, @PathVariable Long itemId) {
        var actor = (UserEntity) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        var targetOpt = officeService.getOfficeById(officeId);
        if(targetOpt.isEmpty())
            return ResponseEntity.notFound().build();

        var target = targetOpt.get();
        if(!adminPermissionService.canManageOffice(actor, target)) {
            return ResponseEntity.notFound().build();
        }
        var item = officeItemService.getOfficeItem(officeId, itemId);
        if(item == null)
            return ResponseEntity.notFound().build();

        var response = officeItemToDto(item);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{itemId}")
    public ResponseEntity<Void> patchItem(
            @PathVariable Long officeId,
            @PathVariable Long itemId,
            @RequestBody @Valid OfficeItemPatchRequest patchRequest) {
        var actor = (UserEntity) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        var targetOpt = officeService.getOfficeById(officeId);
        if(targetOpt.isEmpty())
            return ResponseEntity.notFound().build();

        var target = targetOpt.get();
        if(!adminPermissionService.canManageOffice(actor, target)) {
            return ResponseEntity.notFound().build();
        }

        var item = officeItemService.getOfficeItem(officeId, itemId);
        if(item == null)
            return ResponseEntity.notFound().build();
        if(patchRequest.getOfferId() != null) {
            var offer = officeOfferService.getOffer(officeId, patchRequest.getOfferId());
            if(offer == null)
                throw new ValidationException("offerId", "Offer not found");
            item.setOffer(offer);
        }
        adminOfficeItemMapper.update(patchRequest, item);
        officeItemService.patchOfficeItem(item);

        return ResponseEntity.noContent().build();
    }
}

