package com.officely.backend.service;

import com.officely.backend.api.throwables.ValidationException;
import com.officely.backend.entity.PasswordResetEntity;
import com.officely.backend.entity.UserEntity;
import com.officely.backend.repository.PasswordResetRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.Random;

@Service
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class PasswordResetService {
    private final PasswordResetRepository passwordResetRepository;
    private final AuthenticationService authenticationService;
    private final UserService userService;

    private final String codeCharacters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private final SecureRandom rng = new SecureRandom();
    private String generateCode() {
        StringBuilder code = new StringBuilder();
        for(var i = 0; i < 6; i++) {
            var index = rng.nextInt(codeCharacters.length());
            code.append(codeCharacters.charAt(index));
        }
        return code.toString();
    }

    private void deleteExpiredCodes() {
        passwordResetRepository.deleteByExpiresAtLessThan(LocalDateTime.now());
    }

    @Transactional
    public void sendResetEmail(UserEntity user) {
        deleteExpiredCodes();
        var code = "";
        var i = 0;
        do {
            code = generateCode();
            i++;
            if (i > 1000) {
                // Something's wrong! Abort!
                throw new RuntimeException("Failed to generate unique code in ~1000 tries!");
            }
        }
        while(passwordResetRepository.getByCode(code) != null);
        var entity = new PasswordResetEntity();
        entity.setUser(user);
        entity.setCode(code);
        entity.setExpiresAt(LocalDateTime.now().plusMinutes(15));
        passwordResetRepository.save(entity);
    }

    @Transactional
    public void resetPassword(UserEntity user, String code, String newPassword) throws ValidationException {
        deleteExpiredCodes();
        var entity = passwordResetRepository.getByCode(code.toUpperCase());
        if(entity == null || !Objects.equals(entity.getUser().getId(), user.getId()))
            throw new ValidationException("code", "Invalid code");
        if(!authenticationService.validatePasswordMinimumRequirements(newPassword))
            throw new ValidationException("newPassword", "Password doesn't meet minimum requirements");
        user.setPassword(newPassword);
        userService.patchUser(user);
        passwordResetRepository.delete(entity);
    }
}
