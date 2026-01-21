package com.officely.backend.repository;

import com.officely.backend.entity.OfficePhotoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OfficePhotoRepository extends JpaRepository<OfficePhotoEntity, Long> {
}
