package com.officely.backend.repository;

import com.officely.backend.entity.BookingEntity;
import com.officely.backend.entity.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<BookingEntity, Long>{
    Optional<BookingEntity> findByIdAndUserId(Long bookingId, Long userId);
    Page<BookingEntity> findByUserIdOrderByStartDateDesc(Long userId, Pageable pageable);
    Page<BookingEntity> findByUserIdAndBookingStatusInOrderByStartDateDesc(Long userId, List<BookingStatus> statuses, Pageable pageable);
    Page<BookingEntity> findByUserIdAndBookingStatusNotInAndEndDateBeforeOrderByStartDateDesc(Long userId, List<BookingStatus> statuses, LocalDate now, Pageable pageable);
    Page<BookingEntity> findByUserIdAndBookingStatusNotInAndEndDateGreaterThanEqualOrderByStartDateDesc(Long userId, List<BookingStatus> statuses, LocalDate now, Pageable pageable);

    @Query("select distinct b from BookingEntity b left join OfficeEntity o ON o.id = b.office.id" +
            " left join OfficeMemberEntity m ON m.office.id = o.id" +
            " where o.owner.id = :userId OR m.user.id = :userId")
    Page<BookingEntity> getByAdminUserId(long userId, Pageable pageable);

    Page<BookingEntity> getByOfficeId(long officeId, Pageable pageable);
}
