package com.officely.backend.modules.admin.controller;

import com.officely.backend.api.pagination.PaginationDto;
import com.officely.backend.api.throwables.ValidationException;
import com.officely.backend.entity.UserEntity;
import com.officely.backend.modules.admin.api.users.users.AdminUserMapper;
import com.officely.backend.modules.admin.api.users.PaginatedResponse;
import com.officely.backend.modules.admin.api.users.users.UserDto;
import com.officely.backend.modules.admin.api.users.users.UserPatchRequest;
import com.officely.backend.modules.admin.services.AdminPermissionService;
import com.officely.backend.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class AdminUsersController {
    private final UserService userService;
    private final AdminUserMapper userMapper;
    private final AdminPermissionService adminPermissionService;

    @GetMapping
    @Secured("ROLE_FULL_ACCESS")
    public ResponseEntity<PaginatedResponse<UserDto>> getUsers(@RequestParam @Valid @Min(1) @Max(50) int pageSize, @RequestParam(required = false) Integer pageToken,
                                                  @RequestParam(required = false) String search,
                                                  @RequestParam(required = false) String sortField, @RequestParam(required = false) String sortDirection) {
        var currentPage = pageToken == null ? 0 : pageToken;
        var pageRequest = PageRequest.of(currentPage, pageSize);

        if(sortField != null && sortDirection != null) {
            pageRequest = pageRequest.withSort(sortDirection.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, sortField);
        }

        var users = search != null ? userService.getUsers(pageRequest, search) : userService.getUsers(pageRequest);
        var response = new PaginatedResponse<UserDto>();
        response.setResults(users.get().map(userMapper::userToUserDto).map(e ->
            e.add(
                    linkTo(AdminUsersController.class).slash(e.getId()).withSelfRel(),
                    linkTo(AdminUsersController.class).slash(e.getId()).withRel("update")
            )
        ).toList());

        var pagination = new PaginationDto();
        pagination.setLastPage(users.getTotalPages() - 1);
        pagination.setCurrentPage(currentPage);
        pagination.setPageSize(pageSize);
        response.setPagination(pagination);

        response.add(
                linkTo(methodOn(AdminUsersController.class).getUsers(pageSize, currentPage, search, sortField, sortDirection))
                        .withSelfRel().expand(),
                linkTo(methodOn(AdminUsersController.class).getUsers(pageSize, 0, search, sortField, sortDirection))
                        .withRel("first").expand(),
                linkTo(methodOn(AdminUsersController.class).getUsers(pageSize, pagination.getLastPage(), search, sortField, sortDirection))
                        .withRel("last").expand()
        );
        if(currentPage != pagination.getLastPage()) {
            response.add(
                    linkTo(methodOn(AdminUsersController.class).getUsers(pageSize, currentPage+1, search, sortField, sortDirection))
                            .withRel("next").expand()
            );
        }
        if(currentPage > 0) {
            response.add(
                    linkTo(methodOn(AdminUsersController.class).getUsers(pageSize, currentPage-1, search, sortField, sortDirection))
                            .withRel("prev").expand()
            );
        }

        return ResponseEntity.ok(response);
    }
    private Optional<UserEntity> getTargetUser(UserEntity actor, String userId) {
        UserEntity targetUser;
        if(userId.equals("@me")) {
            targetUser = actor;
        } else {
            try {
                var uid = Long.parseLong(userId);
                targetUser = userService.findById(uid).orElseThrow();
            } catch (Exception ex) {
                return Optional.empty();
            }
        }
        return Optional.of(targetUser);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserDto> getUser(@PathVariable String userId) {
        var actor = (UserEntity) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        var targetUserOpt = getTargetUser(actor, userId);
        if(targetUserOpt.isEmpty())
            return ResponseEntity.notFound().build();

        var targetUser = targetUserOpt.get();
        if(!adminPermissionService.canViewUser(actor, targetUser)) {
            return ResponseEntity.notFound().build();
        }

        var response = userMapper.userToUserDto(targetUser);
        response.add(linkTo(methodOn(AdminUsersController.class).getUser(userId)).withSelfRel());
        if(adminPermissionService.canUpdateUser(actor, targetUser) || adminPermissionService.canBlockUser(actor, targetUser))
            response.add(linkTo(methodOn(AdminUsersController.class).getUser(userId)).withRel("update"));

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{userId}")
    public ResponseEntity<Void> patchUser(@PathVariable String userId, @RequestBody @Valid UserPatchRequest patchRequest) throws ValidationException {
        var actor = (UserEntity) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        var targetUserOpt = getTargetUser(actor, userId);
        if(targetUserOpt.isEmpty())
            return ResponseEntity.notFound().build();

        var targetUser = targetUserOpt.get();

        var canUpdate = adminPermissionService.canUpdateUser(actor, targetUser);
        var canBlock = adminPermissionService.canBlockUser(actor, targetUser);

        if(!canUpdate && !canBlock) {
            return ResponseEntity.notFound().build();
        }

        if(targetUser.isBlocked() != patchRequest.isBlocked() && !canBlock) {
            throw new ValidationException("isBlocked", "You do not have permission to block/unblock this user");
        }
        if(canBlock && targetUser.isBlocked() != patchRequest.isBlocked()) {
            targetUser.setBlocked(patchRequest.isBlocked());
        }
        if(canUpdate) {
            if(patchRequest.getPassword() != null) {
                if(patchRequest.getCurrentPassword() == null)
                    throw new ValidationException("currentPassword", "To change the password currentPassword must be provided");
                if(!patchRequest.getCurrentPassword().equals(targetUser.getPassword()))
                    throw new ValidationException("currentPassword", "Incorrect password");
            }
            userMapper.update(patchRequest, targetUser);
        }
        userService.patchUser(targetUser);
        return ResponseEntity.noContent().build();
    }
}

