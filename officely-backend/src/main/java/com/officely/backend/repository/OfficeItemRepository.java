package com.officely.backend.repository;

import com.officely.backend.entity.OfficeItemEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.NativeQuery;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.Optional;

public interface OfficeItemRepository extends JpaRepository<OfficeItemEntity, Long> {
    Optional<OfficeItemEntity> findByIdAndOfficeId(Long id, Long officeId);

    Page<OfficeItemEntity> getByOfficeId(Long officeId, Pageable pageable);
    Page<OfficeItemEntity> getByOfficeIdAndNameContainingIgnoreCase(Long officeId, String name, Pageable pageable);
    Page<OfficeItemEntity> getByOfficeIdAndIdOrNameContainingIgnoreCase(Long officeId, Long id, String name, Pageable pageable);

    @Modifying
    @Query("update OfficeItemEntity item set item.offer = ?2 where item.offer = ?1")
    void updateOfferId(long sourceId, long targetId);

    @NativeQuery(
            """
SELECT * FROM office_items i WHERE
    i.available AND
    i.offer_id = :offerId AND
    (
        (
            i.type = 0 AND
            NOT EXISTS (
                SELECT 1 FROM bookings b WHERE
                    b.item_id = i.id AND
                    b.booking_status = 'active' AND
                    (b.end_date BETWEEN :start AND :end OR
                     b.start_date BETWEEN :start AND :end)
                )
            ) OR
        (
            i.type = 1 AND
            NOT EXISTS (
                WITH RECURSIVE range_values AS (
                    -- 1. Set the starting point
                    SELECT :start AS generated_date
                    UNION ALL
                    -- 2. Increment until the end point
                    SELECT generated_date + INTERVAL 1 DAY
                    FROM range_values
                    WHERE generated_date < :end
                )
                SELECT 1 FROM (
                    SELECT
                        rv.generated_date,
                        COUNT(b.id) AS total_count
                    FROM range_values rv
                    LEFT JOIN bookings b ON
                                   b.item_id = i.id AND
                                   b.booking_status = 'active' AND
                                   (
                                        b.end_date = rv.generated_date OR
                                        b.start_date = rv.generated_date OR
                                        (b.start_date < rv.generated_date AND b.end_date > rv.generated_date)
                                   )
                    GROUP BY rv.generated_date
                ) s HAVING MAX(s.total_count) >= i.capacity
            )
        )
    )
    LIMIT 1;
"""
    )
    Optional<OfficeItemEntity> findAvailableItem(long offerId, LocalDate start, LocalDate end);
}
