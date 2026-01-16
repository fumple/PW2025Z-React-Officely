package com.officely.backend.repository;

import com.officely.backend.entity.OfficeItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OfficeItemRepository extends JpaRepository<OfficeItemEntity, Long> {
    Optional<OfficeItemEntity> findByIdAndOfficeId(Long id, Long officeId);
}
