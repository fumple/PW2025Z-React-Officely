package com.officely.backend.repository;

import com.officely.backend.entity.OfficeItemEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface OfficeItemRepository extends JpaRepository<OfficeItemEntity, Long> {
    Optional<OfficeItemEntity> findByIdAndOfficeId(Long id, Long officeId);

    Page<OfficeItemEntity> getByOfficeId(Long officeId, Pageable pageable);
    Page<OfficeItemEntity> getByOfficeIdAndNameContainingIgnoreCase(Long officeId, String name, Pageable pageable);
    Page<OfficeItemEntity> getByOfficeIdAndIdOrNameContainingIgnoreCase(Long officeId, Long id, String name, Pageable pageable);

    @Modifying
    @Query("update OfficeItemEntity item set item.offer = ?2 where item.offer = ?1")
    void updateOfferId(long sourceId, long targetId);
}
