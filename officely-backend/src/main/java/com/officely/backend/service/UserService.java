package com.officely.backend.service;

import com.officely.backend.api.users.dto.CreateUserRequestDto;
import com.officely.backend.api.users.dto.CreateUserResponseDto;
import com.officely.backend.api.users.dto.PatchUserRequestDto;
import com.officely.backend.api.users.dto.UserDto;
import com.officely.backend.api.users.mapper.UserMapper;
import com.officely.backend.entity.UserEntity;
import com.officely.backend.repository.UserRepository;
import org.springframework.stereotype.Service;


import java.util.List;
import java.util.NoSuchElementException;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {this.userRepository = userRepository;}

    public List<UserDto> findByEmail(String email) {
        UserEntity user = userRepository.findByEmailIgnoreCase(email);
        if (user == null) { return List.of(); }

        return List.of(UserMapper.toDto(user));
    }

    public CreateUserResponseDto createUser(CreateUserRequestDto request){
        UserEntity existing = userRepository.findByEmailIgnoreCase(request.getEmail());

        if (existing != null) { throw new UnsupportedOperationException();}

        UserEntity entity = new UserEntity(
                request.getEmail(),
                request.getFirstName(),
                request.getLastName(),
                request.getDateOfBirth(),
                request.getNationality(),
                request.getPhoneNumber()
        );

        entity = userRepository.save(entity);
        return new CreateUserResponseDto(entity.getId().toString());
    }

    public void patchUser(String userId, PatchUserRequestDto request) {
        Long id;
        try {
            id = Long.valueOf(userId);
        } catch (NumberFormatException e) {
            throw new NoSuchElementException(userId); //TODO: Error implementation
        }

        boolean success = false;
        UserEntity user = userRepository.findById(id).orElseThrow(() -> new NoSuchElementException("User not found: " + userId));

        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
            success = true;
        }

        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
            success = true;
        }

        if (!success) {
            throw new Error("At least one field must be provided"); //TODO: Implement Errors
        }

        userRepository.save(user);
    }
}

