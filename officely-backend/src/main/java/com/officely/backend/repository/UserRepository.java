package com.officely.backend.repository;

import com.officely.backend.entity.UserEntity;
import com.officely.backend.entity.UserType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {
    Optional<UserEntity> findByTypeAndEmailIgnoreCase(UserType type, String email);
}
