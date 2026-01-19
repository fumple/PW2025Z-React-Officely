package com.officely.backend.service;

import com.officely.backend.config.FlatlyConfig;
import com.officely.backend.entity.UserEntity;
import com.officely.backend.entity.UserType;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class AuthenticationService {
    public record AuthResponse(boolean success, String token, String reason) {
    }

    private final UserService userService;
    private final FlatlyConfig flatlyConfig;

    public AuthResponse logIn(UserType type, String email, String password) {
        if(type == UserType.FLATLY_CUSTOMER) {
            return new AuthResponse(false, null, "Unsupported operation");
        }
        var userOpt = userService.findByTypeAndEmail(type, email);
        if(userOpt.isEmpty()) {
            return new AuthResponse(false, null, "Incorrect email and/or password!");
        }
        var user = userOpt.get();
        if(!user.getPassword().equals(password) && !user.getPassword().isEmpty()) {
            return new AuthResponse(false, null, "Incorrect email and/or password!");
        }
        return new AuthResponse(true, user.getId().toString(), "");
    }

    public boolean logOut(UserType type, String token) {
        return true;
    }

    public boolean checkFlatlyToken(String token) {
        return flatlyConfig.getToken().equals(token);
    }
    public Optional<UserEntity> checkAdminToken(String token) {
        try {
            var id = Long.parseLong(token);
            return userService.findById(id);
        } catch (NumberFormatException ex) {
            return Optional.empty();
        }
    }

    public boolean validatePasswordMinimumRequirements(String password) {
        return password.length() >= 8 && password.length() <= 64;
    }
}
