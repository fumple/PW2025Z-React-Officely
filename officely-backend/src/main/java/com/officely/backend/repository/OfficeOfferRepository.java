package com.officely.backend.repository;

import com.officely.backend.entity.OfficeOfferEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.NativeQuery;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface OfficeOfferRepository extends JpaRepository<OfficeOfferEntity, Long>,  JpaSpecificationExecutor<OfficeOfferEntity>{
    Optional<OfficeOfferEntity> findByIdAndOfficeId(Long offerId, Long officeId);


    Page<OfficeOfferEntity> getByOfficeId(Long officeId, Pageable pageable);
    Page<OfficeOfferEntity> getByOfficeIdAndNameContainingIgnoreCaseOrPublicNameContainingIgnoreCase(Long officeId, String name, String publicName, Pageable pageable);
    Page<OfficeOfferEntity> getByOfficeIdAndIdOrNameContainingIgnoreCaseOrPublicNameContainingIgnoreCase(Long officeId, Long id, String name, String publicName, Pageable pageable);

    // Filters should be a JSON object!
    @NativeQuery(
            """
SELECT * FROM office_offers o WHERE o.office_id = :officeId AND o.available AND o.price_per_day BETWEEN :minPricePerDay AND :maxPricePerDay AND JSON_CONTAINS(o.properties, :filters) AND EXISTS (
    SELECT * FROM office_items i WHERE
        i.available AND
        i.offer_id = o.id AND
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
);
"""
    )
    List<OfficeOfferEntity> findAvailableOffers(long officeId, LocalDate start, LocalDate end, int minPricePerDay, int maxPricePerDay, String filters);
}

