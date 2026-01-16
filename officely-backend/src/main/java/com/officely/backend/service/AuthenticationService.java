package com.officely.backend.service;

import com.officely.backend.config.FlatlyConfig;
import com.officely.backend.entity.UserType;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

    public boolean checkFlatlyToken(String token) {
        return flatlyConfig.getToken().equals(token);
    }
}
