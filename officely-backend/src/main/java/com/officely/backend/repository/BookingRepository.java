package com.officely.backend.repository;

import com.officely.backend.entity.BookingEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<BookingEntity, Long>{
    Optional<BookingEntity> findByIdAndUserId(Long bookingId, Long userId);
    Page<BookingEntity> findByUserIdOrderByStartDateDesc(Long userId, Pageable pageable);

    @Query("select distinct b from BookingEntity b left join OfficeEntity o ON o.id = b.office.id" +
            " left join OfficeMemberEntity m ON m.office.id = o.id" +
            " where o.owner.id = :userId OR m.user.id = :userId")
    Page<BookingEntity> getByAdminUserId(long userId, Pageable pageable);

    Page<BookingEntity> getByOfficeId(long officeId, Pageable pageable);
}
