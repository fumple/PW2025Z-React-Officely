package com.officely.backend.modules.mobile.controller;

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
@RequestMapping("/mobile")
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class MobileAuthController {
    private final AuthenticationService authenticationService;
    private final AuthMapper authMapper;
    private final UserService userService;
    private final PasswordResetService passwordResetService;

    @PostMapping("/login")
    public LoginResponse logIn(@RequestBody @Valid LoginRequest request) throws AuthException {
        if (!request.getType().equals("customer")) {
            throw new ValidationException("type", "User type must be 'customer'");
        }
        var result = authenticationService.logIn(UserType.LOCAL_CUSTOMER, request.getEmail(), request.getPassword());
        if (result.success()) {
            var response = new LoginResponse();
            response.setToken(result.token());
            return response;
        }
        throw new AuthException(result.reason());
    }

    @PostMapping("/signup")
    public ResponseEntity<Void> signUp(@RequestBody @Valid SignUpRequest request) throws ValidationException {
        if (!request.getType().equals("customer")) {
            throw new ValidationException("type", "User type must be 'customer'");
        }
        var user = authMapper.signUpRequestToUser(request);
        user.setType(UserType.LOCAL_CUSTOMER);
        try {
            userService.createUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (UnsupportedOperationException ex) {
            throw new ValidationException("email", "An user with this email already exists!");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logOut(@RequestHeader HttpHeaders headers) {
        var header = headers.get("Authorization");
        if (header == null || header.size() != 1)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        if (authenticationService.logOut(UserType.LOCAL_CUSTOMER, header.getFirst()))
            return ResponseEntity.ok().build();
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @PostMapping("/resetPasswordEmail")
    public ResponseEntity<Void> resetPasswordEmail(@RequestBody @Valid ResetPasswordEmailRequest request) throws ValidationException {
        var user = userService.findByTypeAndEmail(UserType.LOCAL_CUSTOMER, request.getEmail());
        if (user.isEmpty()) {
            throw new ValidationException("email", "Invalid email address");
        }
        passwordResetService.sendResetEmail(user.get());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/resetPassword")
    public ResponseEntity<Void> resetPassword(@RequestBody @Valid ResetPasswordRequest request) throws ValidationException {
        var user = userService.findByTypeAndEmail(UserType.LOCAL_CUSTOMER, request.getEmail());
        if (user.isEmpty()) {
            throw new ValidationException("email", "Invalid email address");
        }
        passwordResetService.resetPassword(user.get(), request.getCode(), request.getNewPassword());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/checkResetCode")
    public ResponseEntity<CheckResetCodeResponse> checkResetCode(@RequestBody @Valid CheckResetCodeRequest request) throws ValidationException {
        var user = userService.findByTypeAndEmail(UserType.LOCAL_CUSTOMER, request.getEmail());
        if(user.isEmpty()) {
            throw new ValidationException("email", "Invalid email address");
        }
        return ResponseEntity.ok(new CheckResetCodeResponse(passwordResetService.checkResetCode(user.get(), request.getCode())));
    }
}
