package com.officely.backend.repository;

import com.officely.backend.entity.BookingEntity;
import com.officely.backend.entity.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import java.awt.print.Book;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<BookingEntity, Long>{
    Optional<List<BookingEntity>> findByUserId(Long userId);
    Optional<BookingEntity> findByIdAndUserId(Long bookingId, Long userId);
    Page<BookingEntity> findByUserIdOrderByStartDateDesc(Long userId, Pageable pageable);
}
