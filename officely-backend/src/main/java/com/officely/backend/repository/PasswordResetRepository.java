package com.officely.backend.repository;

import com.officely.backend.entity.PasswordResetEntity;
import lombok.NonNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface PasswordResetRepository extends JpaRepository<PasswordResetEntity, Long> {
    void deleteByExpiresAtLessThan(LocalDateTime currentTime);
    PasswordResetEntity getByCode(String code);
}
