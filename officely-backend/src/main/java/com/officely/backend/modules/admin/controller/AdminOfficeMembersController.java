package com.officely.backend.modules.admin.controller;

import com.officely.backend.api.CreatedResponse;
import com.officely.backend.api.ListResponse;
import com.officely.backend.api.throwables.ValidationException;
import com.officely.backend.entity.OfficeMemberEntity;
import com.officely.backend.entity.UserEntity;
import com.officely.backend.modules.admin.api.officemembers.AdminOfficeMemberMapper;
import com.officely.backend.modules.admin.api.officemembers.OfficeMemberDto;
import com.officely.backend.modules.admin.api.officemembers.OfficeMemberPostRequest;
import com.officely.backend.modules.admin.services.AdminPermissionService;
import com.officely.backend.service.OfficeMemberService;
import com.officely.backend.service.OfficeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@RestController
@RequestMapping("/admin/offices/{officeId}/members")
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class AdminOfficeMembersController {

    private final OfficeService officeService;
    private final AdminPermissionService adminPermissionService;
    private final OfficeMemberService officeMemberService;
    private final AdminOfficeMemberMapper adminOfficeMemberMapper;

    private OfficeMemberDto toDto(UserEntity actor, OfficeMemberEntity member) {
        var e = adminOfficeMemberMapper.officeMemberToOfficeMemberDto(member);
        e.add(
                linkTo(methodOn(AdminOfficeMembersController.class)
                        .getMember(member.getOffice().getId(), member.getId())).withSelfRel(),
                linkTo(methodOn(AdminOfficesController.class)
                        .getOffice(member.getOffice().getId())).withRel("office")
        );
        if (adminPermissionService.canUpdateOfficeDetails(actor, member.getOffice())) {
            e.add(linkTo(methodOn(AdminOfficeMembersController.class)
                    .deleteMember(member.getOffice().getId(), member.getId())).withRel("delete"));
        }
        return e;
    }

    @GetMapping
    public ResponseEntity<ListResponse<OfficeMemberDto>> getMembers(@PathVariable Long officeId) {
        var actor = (UserEntity) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        var targetOpt = officeService.getOfficeById(officeId);
        if (targetOpt.isEmpty())
            return ResponseEntity.notFound().build();

        var target = targetOpt.get();
        if (!adminPermissionService.canManageOffice(actor, target)) {
            return ResponseEntity.notFound().build();
        }

        var items = officeMemberService.getMembers(officeId).stream().map(e -> toDto(actor, e)).toList();
        var response = new ListResponse<OfficeMemberDto>();
        response.setResults(items);
        response.add(linkTo(methodOn(AdminOfficeMembersController.class).getMembers(officeId)).withSelfRel());
        if (adminPermissionService.canUpdateOfficeDetails(actor, target)) {
            response.add(linkTo(methodOn(AdminOfficeMembersController.class).getMembers(officeId)).withRel("create"));
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<CreatedResponse> createMember(@PathVariable Long officeId, @RequestBody @Valid OfficeMemberPostRequest request) {
        var actor = (UserEntity) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        var targetOpt = officeService.getOfficeById(officeId);
        if (targetOpt.isEmpty())
            return ResponseEntity.notFound().build();

        var target = targetOpt.get();
        if (!adminPermissionService.canUpdateOfficeDetails(actor, target)) {
            return ResponseEntity.notFound().build();
        }

        OfficeMemberEntity membership;
        try {
            membership = officeMemberService.createMember(target, request.getEmail());
        } catch (ValidationException e) {
            throw new ValidationException("userId", e.getMessage());
        }

        return ResponseEntity.created(linkTo(methodOn(AdminOfficeMembersController.class)
                        .getMember(officeId, membership.getId())).toUri())
                .body(new CreatedResponse(membership.getId().toString()));
    }

    @GetMapping("/{membershipId}")
    public ResponseEntity<OfficeMemberDto> getMember(@PathVariable Long officeId, @PathVariable Long membershipId) {
        var actor = (UserEntity) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        var targetOpt = officeService.getOfficeById(officeId);
        if (targetOpt.isEmpty())
            return ResponseEntity.notFound().build();

        var target = targetOpt.get();
        if (!adminPermissionService.canManageOffice(actor, target)) {
            return ResponseEntity.notFound().build();
        }

        var item = officeMemberService.getMember(officeId, membershipId);
        if (item.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(toDto(actor, item.get()));
    }

    @DeleteMapping("/{membershipId}")
    @Transactional
    public ResponseEntity<OfficeMemberDto> deleteMember(@PathVariable Long officeId, @PathVariable Long membershipId) {
        var actor = (UserEntity) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        var targetOpt = officeService.getOfficeById(officeId);
        if (targetOpt.isEmpty())
            return ResponseEntity.notFound().build();

        var target = targetOpt.get();
        if (!adminPermissionService.canUpdateOfficeDetails(actor, target)) {
            return ResponseEntity.notFound().build();
        }

        var item = officeMemberService.getMember(officeId, membershipId);
        if (item.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        officeMemberService.deleteMember(officeId, membershipId);

        return ResponseEntity.noContent().build();
    }
}
