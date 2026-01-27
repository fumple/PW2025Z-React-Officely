package com.officely.backend.modules.mobile.controller;

import com.officely.backend.api.throwables.ValidationException;
import com.officely.backend.entity.UserEntity;
import com.officely.backend.entity.UserType;
import com.officely.backend.modules.mobile.api.users.MobileUserDto;
import com.officely.backend.modules.mobile.api.users.MobileUserMapper;
import com.officely.backend.modules.mobile.api.users.MobileUserPatchRequest;
import com.officely.backend.service.AuthenticationService;
import com.officely.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@RestController
@RequestMapping("/mobile/users")
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class MobileUsersController {
    private final UserService userService;
    private final AuthenticationService authenticationService;
    private final MobileUserMapper userMapper;

    @GetMapping("/@me")
    public ResponseEntity<MobileUserDto> getMe() {
        var actor = (UserEntity) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        var dto = userMapper.userToDto(actor);

        dto.setType("local_customer");

        dto.add(linkTo(methodOn(MobileUsersController.class).getMe()).withSelfRel());
        dto.add(linkTo(methodOn(MobileUsersController.class).patchMe(null)).withRel("update"));
//        dto.add(linkTo(methodOn(MobileBookingsController.class).getUserBookings(actor.getId().toString())).withRel("bookings"));

        return ResponseEntity.ok(dto);
    }

    @PatchMapping("/@me")
    public ResponseEntity<Void> patchMe(@RequestBody @Valid MobileUserPatchRequest patchRequest) throws ValidationException {
        var actor = (UserEntity) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (patchRequest.getEmail() != null && !patchRequest.getEmail().equalsIgnoreCase(actor.getEmail())) {
            var existing = userService.findByTypeAndEmail(UserType.LOCAL_CUSTOMER, patchRequest.getEmail());
            if (existing.isPresent() && !existing.get().getId().equals(actor.getId())) {
                throw new ValidationException("email", "Email already exists");
            }
        }

        if (patchRequest.getPassword() != null && !authenticationService.validatePasswordMinimumRequirements(patchRequest.getPassword())) {
            throw new ValidationException("password", "Password must be between 8 and 64 characters");
        }

        userMapper.patch(patchRequest, actor);
        userService.patchUser(actor);

        return ResponseEntity.ok().build();
    }
}

