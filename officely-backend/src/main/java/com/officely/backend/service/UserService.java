package com.officely.backend.service;

import com.officely.backend.entity.UserEntity;
import com.officely.backend.entity.UserType;
import com.officely.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;


import java.util.Optional;

@Service
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class UserService {
    private final UserRepository userRepository;

    public Optional<UserEntity> findByTypeAndEmail(UserType type, String email) {
        return userRepository.findByTypeAndEmailIgnoreCase(type, email);
    }
    public Optional<UserEntity> findById(long id) {
        return userRepository.findById(id);
    }

    public UserEntity createUser(UserEntity entity){
        var existing = userRepository.findByTypeAndEmailIgnoreCase(entity.getType(), entity.getEmail());
        if (existing.isPresent()) { throw new UnsupportedOperationException();}

        return userRepository.save(entity);
    }

    public UserEntity patchUser(UserEntity updated) {
        return userRepository.save(updated);
    }
    public Page<UserEntity> getUsers(PageRequest pageRequest) {
        return userRepository.findAll(pageRequest);
    }
    public Page<UserEntity> getUsers(PageRequest pageRequest, String search) {
        try {
            var id = Long.parseLong(search);
            return userRepository.getByIdOrFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(id, search, search, pageRequest);
        } catch (Exception ex) {
            return userRepository.getByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(search, search, pageRequest);
        }
    }
}

