package com.officely.backend.modules.admin.controller;

import com.officely.backend.api.auth.*;
import com.officely.backend.api.throwables.AuthException;
import com.officely.backend.api.throwables.ValidationException;
import com.officely.backend.entity.UserType;
import com.officely.backend.service.AuthenticationService;
import com.officely.backend.service.PasswordResetService;
import com.officely.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class AdminAuthController {
    private final AuthenticationService authenticationService;
    private final AuthMapper authMapper;
    private final UserService userService;
    private final PasswordResetService passwordResetService;

    @PostMapping("/login")
    public LoginResponse logIn(@RequestBody @Valid LoginRequest request) throws AuthException {
        var result = authenticationService.logIn(UserType.ADMIN, request.getEmail(), request.getPassword());
        if(result.success()) {
            var response = new LoginResponse();
            response.setToken(result.token());
            return response;
        }
        else {
            throw new AuthException(result.reason());
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<Void> signUp(@RequestBody @Valid SignUpRequest request) {
        var user = authMapper.signUpRequestToUser(request);
        user.setType(UserType.ADMIN);
        userService.createUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logOut(@RequestHeader HttpHeaders headers) {
        var header = headers.get("Authorization");
        if(header == null || header.size() != 1)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        if(authenticationService.logOut(UserType.ADMIN, header.getFirst()))
            return ResponseEntity.ok().build();
        else
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @PostMapping("/resetPasswordEmail")
    public ResponseEntity<Void> resetPasswordEmail(@RequestBody @Valid ResetPasswordEmailRequest request) throws ValidationException {
        var user = userService.findByTypeAndEmail(UserType.ADMIN, request.getEmail());
        if(user.isEmpty()) {
            throw new ValidationException("email", "Invalid email address");
        }
        passwordResetService.sendResetEmail(user.get());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/resetPassword")
    public ResponseEntity<Void> resetPassword(@RequestBody @Valid ResetPasswordRequest request) throws ValidationException {
        var user = userService.findByTypeAndEmail(UserType.ADMIN, request.getEmail());
        if(user.isEmpty()) {
            throw new ValidationException("email", "Invalid email address");
        }
        passwordResetService.resetPassword(user.get(), request.getCode(), request.getNewPassword());
        return ResponseEntity.ok().build();
    }
}
