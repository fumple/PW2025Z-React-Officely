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
import com.officely.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;

@RestController
@RequestMapping("/admin/offices/{officeId}/members")
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class AdminOfficeMembersController {

    private final OfficeService officeService;
    private final AdminPermissionService adminPermissionService;
    private final OfficeMemberService officeMemberService;
    private final AdminOfficeMemberMapper adminOfficeMemberMapper;
    private final UserService userService;

    private OfficeMemberDto toDto(UserEntity actor, OfficeMemberEntity member) {
        var e = adminOfficeMemberMapper.officeMemberToOfficeMemberDto(member);
        e.add(
                linkTo(AdminOfficeMembersController.class).slash(e.getId()).withSelfRel(),
                linkTo(AdminOfficesController.class).slash(member.getOffice().getId()).withRel("office")
        );
        if (adminPermissionService.canUpdateOfficeDetails(actor, member.getOffice())) {
            e.add(linkTo(AdminOfficeMembersController.class).slash(e.getId()).withRel("delete"));
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
        response.add(linkTo(AdminOfficeMembersController.class).withSelfRel());
        if (adminPermissionService.canUpdateOfficeDetails(actor, target)) {
            response.add(linkTo(AdminOfficeMembersController.class).withRel("create"));
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

        var user = userService.findById(request.getUserId());
        if (user.isEmpty()) {
            throw new ValidationException("userId", "User was not found");
        }

        var membership = officeMemberService.createMember(target, user.get());
        if (membership.isEmpty()) {
            throw new ValidationException("userId", "Failed to create membership, user may already be a member!");
        }

        return ResponseEntity.created(linkTo(AdminOfficeMembersController.class).slash(membership.get().getId()).toUri())
                .body(new CreatedResponse(membership.get().getId().toString()));
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
