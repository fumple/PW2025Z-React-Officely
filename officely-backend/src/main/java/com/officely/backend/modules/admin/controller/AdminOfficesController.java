package com.officely.backend.modules.admin.controller;

import com.officely.backend.api.CreatedResponse;
import com.officely.backend.api.pagination.PaginationDto;
import com.officely.backend.api.throwables.ValidationException;
import com.officely.backend.entity.OfficeEntity;
import com.officely.backend.entity.OfficePhotoEntity;
import com.officely.backend.entity.UserEntity;
import com.officely.backend.api.PaginatedResponse;
import com.officely.backend.modules.admin.api.offices.AdminOfficeMapper;
import com.officely.backend.modules.admin.api.offices.OfficeDto;
import com.officely.backend.modules.admin.api.offices.OfficePatchRequest;
import com.officely.backend.modules.admin.api.offices.OfficePostRequest;
import com.officely.backend.modules.admin.services.AdminPermissionService;
import com.officely.backend.service.Geocoding;
import com.officely.backend.service.OfficeService;
import com.officely.backend.storage.StorageService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@RestController
@RequestMapping("/admin/offices")
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class AdminOfficesController {
    private final OfficeService officeService;
    private final AdminOfficeMapper officeMapper;
    private final AdminPermissionService adminPermissionService;
    private final StorageService storageService;
    private final Geocoding geocoding;

    private OfficeDto toDto(UserEntity actor, OfficeEntity office) {
        var e = officeMapper.officeToOfficeDto(office);
        e.add(
                linkTo(AdminOfficesController.class).slash(e.getId()).withSelfRel(),
                linkTo(AdminOfficesController.class).slash(e.getId()).slash("items").withRel("items"),
                linkTo(AdminOfficesController.class).slash(e.getId()).slash("offers").withRel("offers"),
                linkTo(AdminOfficesController.class).slash(e.getId()).slash("members").withRel("members")
        );
        if (adminPermissionService.canUpdateOfficeDetails(actor, office)) {
            e.add(linkTo(AdminOfficesController.class).slash(e.getId()).withRel("update"));
        }
        return e;
    }

    @GetMapping
    public ResponseEntity<PaginatedResponse<OfficeDto>> getOffices(@RequestParam @Valid @Min(1) @Max(50) int pageSize, @RequestParam(required = false) Integer pageToken,
                                                                   @RequestParam(required = false) String search,
                                                                   @RequestParam(required = false) String sortField, @RequestParam(required = false) String sortDirection) {
        var actor = (UserEntity) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        var currentPage = pageToken == null ? 0 : pageToken;
        var pageRequest = PageRequest.of(currentPage, pageSize);

        if(sortField != null && sortDirection != null) {
            pageRequest = pageRequest.withSort(sortDirection.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, sortField);
        }

        var offices = search != null ? officeService.getOffices(pageRequest, search) : officeService.getOffices(pageRequest);
        var response = new PaginatedResponse<OfficeDto>();
        response.setResults(offices.get().map(e -> toDto(actor, e)).toList());

        var pagination = new PaginationDto();
        pagination.setLastPage(Math.max(offices.getTotalPages() - 1, 0));
        pagination.setCurrentPage(currentPage);
        pagination.setPageSize(pageSize);
        response.setPagination(pagination);

        response.add(
                linkTo(methodOn(AdminOfficesController.class).getOffices(pageSize, currentPage, search, sortField, sortDirection))
                        .withSelfRel().expand(),
                linkTo(methodOn(AdminOfficesController.class).getOffices(pageSize, 0, search, sortField, sortDirection))
                        .withRel("first").expand(),
                linkTo(methodOn(AdminOfficesController.class).getOffices(pageSize, pagination.getLastPage(), search, sortField, sortDirection))
                        .withRel("last").expand()
        );
        if(currentPage != pagination.getLastPage()) {
            response.add(
                    linkTo(methodOn(AdminOfficesController.class).getOffices(pageSize, currentPage+1, search, sortField, sortDirection))
                            .withRel("next").expand()
            );
        }
        if(currentPage > 0) {
            response.add(
                    linkTo(methodOn(AdminOfficesController.class).getOffices(pageSize, currentPage-1, search, sortField, sortDirection))
                            .withRel("prev").expand()
            );
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CreatedResponse> createOffice(
            @RequestPart("office") @Valid OfficePostRequest request,
            @RequestPart("images") List<MultipartFile> images) {
        var actor = (UserEntity) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        var office = officeMapper.officePostRequestToOffice(request);
        office.setOwner(actor);
        Geocoding.GeoPoint origin = geocoding.geocode(request.getAddress());
        if (origin == null) {
            throw new IllegalArgumentException("Unable to geocode nearAddress");
        }
        office.setLatitude(origin.getLat());
        office.setLongitude(origin.getLng());
        office.setPhotos(images.stream().map(e -> {
            var entity = new OfficePhotoEntity();
            var filename = storageService.store(e);
            entity.setFilename(filename);
            entity.setOffice(office);
            return entity;
        }).toList());
        var created = officeService.createOffice(office);
        return ResponseEntity.created(linkTo(methodOn(AdminOfficesController.class).getOffice(created.getId())).toUri())
                .body(new CreatedResponse(created.getId().toString()));
    }

    @GetMapping("/{officeId}")
    public ResponseEntity<OfficeDto> getOffice(@PathVariable Long officeId) {
        var actor = (UserEntity) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        var targetOpt = officeService.getOfficeById(officeId);
        if(targetOpt.isEmpty())
            return ResponseEntity.notFound().build();

        var target = targetOpt.get();
        if(!adminPermissionService.canManageOffice(actor, target)) {
            return ResponseEntity.notFound().build();
        }

        var response = officeMapper.officeToOfficeDto(target);
        response.add(linkTo(methodOn(AdminOfficesController.class).getOffice(officeId)).withSelfRel());
        if(adminPermissionService.canUpdateOfficeDetails(actor, target))
            response.add(linkTo(methodOn(AdminOfficesController.class).getOffice(officeId)).withRel("update"));

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{officeId}")
    public ResponseEntity<Void> patchOffice(
            @PathVariable Long officeId,
            @RequestPart("office") @Valid OfficePatchRequest patchRequest,
            @RequestPart(value = "addedImages", required = false) List<MultipartFile> addedImages) {
        var actor = (UserEntity) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        var targetOpt = officeService.getOfficeById(officeId);
        if(targetOpt.isEmpty())
            return ResponseEntity.notFound().build();

        var target = targetOpt.get();
        var canView = adminPermissionService.canManageOffice(actor, target);
        var canUpdateDetails = adminPermissionService.canUpdateOfficeDetails(actor, target);
        if(!canView) {
            return ResponseEntity.notFound().build();
        }
        if(!canUpdateDetails) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        officeMapper.update(patchRequest, target);
        try {
            officeService.patchOffice(target,
                    patchRequest.getImages() != null ? patchRequest.getImages() : List.of(),
                    addedImages != null ? addedImages : List.of()
            );
        } catch (Exception e) {
            throw new ValidationException("images", e.getMessage());
        }

        return ResponseEntity.noContent().build();
    }
}

