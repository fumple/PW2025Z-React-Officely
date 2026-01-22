package com.officely.backend.repository;

import com.officely.backend.entity.OfficeOfferEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OfficeOfferRepository extends JpaRepository<OfficeOfferEntity, Long>,  JpaSpecificationExecutor<OfficeOfferEntity>{
    interface OfficeMinPrice {
        Long getOfficeId();
        Long getMinPrice();
    }

    Optional<OfficeOfferEntity> findByIdAndOfficeId(Long offerId, Long officeId);

    @Query(
        value = """
            SELECT
              oo.office_id AS officeId,
              MIN(oo.price_per_day) * :days AS minPrice
            FROM office_offers oo
            GROUP BY oo.office_id
            HAVING (:minPrice IS NULL OR MIN(oo.price_per_day) * :days >= :minPrice)
               AND (:maxPrice IS NULL OR MIN(oo.price_per_day) * :days <= :maxPrice)
            ORDER BY minPrice ASC, oo.office_Id ASC
        """,
        countQuery = """
            SELECT COUNT(*) FROM (
              SELECT oo.office_id
              FROM office_offers oo
              GROUP BY oo.office_id
              HAVING (:minPrice IS NULL OR MIN(oo.price_per_day) * :days >= :minPrice)
                 AND (:maxPrice IS NULL OR MIN(oo.price_per_day) * :days <= :maxPrice)
            ) table
        """,
        nativeQuery = true
    )
    Page<OfficeMinPrice> findOfficeMinPricesAsc(
            @Param("days") long days,
            @Param("minPrice") Integer minPrice,
            @Param("maxPrice") Integer maxPrice,
            Pageable pageable
    );

    @Query(
        value = """
            SELECT
              oo.office_id AS officeId,
              MIN(oo.price_per_day) * :days AS minPrice
            FROM office_offers oo
            GROUP BY oo.office_id
            HAVING (:minPrice IS NULL OR MIN(oo.price_per_day) * :days >= :minPrice)
               AND (:maxPrice IS NULL OR MIN(oo.price_per_day) * :days <= :maxPrice)
            ORDER BY minPrice DESC, oo.office_id ASC
        """,
        countQuery = """
            SELECT COUNT(*) FROM (
              SELECT oo.office_id
              FROM office_offers oo
              GROUP BY oo.office_id
              HAVING (:minPrice IS NULL OR MIN(oo.price_per_day) * :days >= :minPrice)
                 AND (:maxPrice IS NULL OR MIN(oo.price_per_day) * :days <= :maxPrice)
            ) table
        """,
        nativeQuery = true
    )
    Page<OfficeMinPrice> findOfficeMinPricesDesc(
            @Param("days") long days,
            @Param("minPrice") Integer minPrice,
            @Param("maxPrice") Integer maxPrice,
            Pageable pageable
    );

    List<OfficeOfferEntity> findByOfficeId(Long officeId);

    Page<OfficeOfferEntity> getByOfficeId(Long officeId, Pageable pageable);
    Page<OfficeOfferEntity> getByOfficeIdAndNameContainingIgnoreCaseOrPublicNameContainingIgnoreCase(Long officeId, String name, String publicName, Pageable pageable);
    Page<OfficeOfferEntity> getByOfficeIdAndIdOrNameContainingIgnoreCaseOrPublicNameContainingIgnoreCase(Long officeId, Long id, String name, String publicName, Pageable pageable);
}

