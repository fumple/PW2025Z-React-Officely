package com.officely.backend.modules.admin.controller;

import com.officely.backend.api.pagination.PaginationDto;
import com.officely.backend.modules.admin.api.users.AdminUserMapper;
import com.officely.backend.modules.admin.api.users.UsersResponse;
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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class AdminUsersController {
    private final UserService userService;
    private final AdminUserMapper userMapper;

    @GetMapping
    @Secured("ROLE_FULL_ACCESS")
    public ResponseEntity<UsersResponse> getUsers(@RequestParam @Valid @Min(1) @Max(50) int pageSize, @RequestParam(required = false) Integer pageToken,
                                                  @RequestParam(required = false) String search,
                                                  @RequestParam(required = false) String sortField, @RequestParam(required = false) String sortDirection) {
        var currentPage = pageToken == null ? 0 : pageToken;
        var pageRequest = PageRequest.of(currentPage, pageSize);

        if(sortField != null && sortDirection != null) {
            pageRequest = pageRequest.withSort(sortDirection.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, sortField);
        }

        var users = search != null ? userService.getUsers(pageRequest, search) : userService.getUsers(pageRequest);
        var response = new UsersResponse();
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
}

