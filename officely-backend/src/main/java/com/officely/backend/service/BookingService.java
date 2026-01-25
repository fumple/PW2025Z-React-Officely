package com.officely.backend.service;

import com.officely.backend.api.throwables.ActionNotAllowedException;
import com.officely.backend.entity.*;
import com.officely.backend.repository.BookingRepository;
import com.officely.backend.repository.OfficeOfferRepository;
import com.officely.backend.repository.PaymentRepository;
import com.officely.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class BookingService {
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final OfficeOfferRepository officeOfferRepository;
    private final PaymentRepository paymentRepository;

    public Long bookOfficeUsingOffer(
            long officeId,
            long offerId,
            long userId,
            LocalDate startDate,
            LocalDate endDate
    ) {
        if (startDate == null || endDate == null || !endDate.isAfter(startDate) || startDate.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Invalid booking period");
        }

        long days = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate);
        if (days < 1) {
            throw new IllegalArgumentException("The booking period must last at least 1 day");
        }

        UserEntity userEntity = userRepository.findById(userId).orElseThrow(() -> new NoSuchElementException("User not found"));
        OfficeOfferEntity officeOfferEntity = officeOfferRepository.findByIdAndOfficeId(offerId, officeId)
                .orElseThrow(() -> new NoSuchElementException("The given office or offer was not found"));
        OfficeEntity officeEntity = officeOfferEntity.getOffice();

        BookingStatus status = BookingStatus.active;
        Instant creationDate = Instant.now();
        Integer totalPrice = (int) (officeOfferEntity.getPricePerDay() * days);

        BookingEntity bookingEntity = new BookingEntity(userEntity, officeEntity, officeOfferEntity, null, // TODO: FIND AVAILABLE ITEM!
                status, startDate, endDate, creationDate, totalPrice);

        Long bookingId = bookingRepository.save(bookingEntity).getId();

        PaymentEntity payment = new PaymentEntity();
        payment.setAccountNumber(officeEntity.getPaymentAccountNumber());
        payment.setReceiverName(officeEntity.getPaymentReceiverName());
        payment.setTransferTitle("BOOKING " + bookingId);
        payment.setDueDate(bookingEntity.getCreationDate().plus(officeOfferEntity.getPaymentHours(), ChronoUnit.HOURS));
        payment.setStatus(PaymentStatus.pendingPayment);
        payment.setBooking(bookingEntity);
        bookingEntity.setPaymentInfo(payment);

        paymentRepository.save(payment);

        return bookingId;
    }

    public BookingEntity getBookingInfo(long userId, long bookingId){
        return bookingRepository.findByIdAndUserId(bookingId, userId)
                .orElseThrow(() -> new NoSuchElementException("The given user or booking was not found"));
    }

    public Page<BookingEntity> getUserBookings(Long userId, int pageSize, Integer pageToken){
        if (pageSize <= 0 || pageSize>50){ pageSize = 50; }
        int pageIndex = checkPageIndex(pageToken);

        PageRequest pageRequest = PageRequest.of(pageIndex, pageSize, Sort
                .by(Sort.Direction.DESC, "startDate")
                .and(Sort.by(Sort.Direction.DESC, "id"))
        );

        return bookingRepository.findByUserIdOrderByStartDateDesc(userId, pageRequest);
    }

    public void cancelBooking(String userId, String bookingId){
        Long userIdLong = parseId(userId, "userId");
        Long bookingIdLong = parseId(bookingId, "bookingId");

        BookingEntity booking = bookingRepository.findByIdAndUserId(bookingIdLong, userIdLong)
                .orElseThrow(() -> new NoSuchElementException("The given user or booking was not found"));
        cancelBooking(booking);
    }

    public void cancelBooking(BookingEntity booking){
        var denyReason = canBookingBeCancelled(booking, true);
        if (denyReason != null) {
            throw new ActionNotAllowedException(denyReason);
        }

        booking.setBookingStatus(BookingStatus.cancelledByUser);
        booking.getPaymentInfo().setStatus(booking.getPaymentInfo().getStatus() == PaymentStatus.received ?
                PaymentStatus.pendingRefund : PaymentStatus.cancelled);
        paymentRepository.save(booking.getPaymentInfo());
        bookingRepository.save(booking);
    }
    public String canBookingBeCancelled(BookingEntity booking, boolean asStaff) {
        BookingStatus status = booking.getBookingStatus();
        if (status == BookingStatus.cancelledByUser || status == BookingStatus.cancelledByStaff) {
            return "Booking is already cancelled";
        }
        if (!asStaff && booking.getStartDate().isBefore(LocalDate.now())) {
            return "Cancelling a past/active booking is not allowed";
        }
        if (asStaff && booking.getEndDate().isBefore(LocalDate.now())) {
            return "Cancelling a past booking is not allowed";
        }
        if(!asStaff) {
            int freeHours = booking.getOffer().getFreeCancellationHours();
            ZoneId zone = ZoneId.of("UTC");
            Instant start = booking.getStartDate().atStartOfDay(zone).toInstant();

            Instant deadline = start.minus(Duration.ofHours(freeHours));
            Instant now = Instant.now();

            if(now.isAfter(deadline)){
                return "Cancellation deadline has passed";
            }
        }
        return null;
    }
    public void cancelBookingAsStaff(BookingEntity booking, boolean withRefund, String reason){
        var denyReason = canBookingBeCancelled(booking, true);
        if (denyReason != null) {
            throw new ActionNotAllowedException(denyReason);
        }

        booking.setBookingStatus(BookingStatus.cancelledByStaff);
        booking.setCancellationReason(reason);
        if(withRefund) {
            booking.getPaymentInfo().setStatus(booking.getPaymentInfo().getStatus() == PaymentStatus.received ?
                    PaymentStatus.pendingRefund : PaymentStatus.cancelled);
        } else {
            booking.getPaymentInfo().setStatus(booking.getPaymentInfo().getStatus() == PaymentStatus.pendingPayment ?
                    PaymentStatus.cancelled : booking.getPaymentInfo().getStatus());
        }
        paymentRepository.save(booking.getPaymentInfo());
        bookingRepository.save(booking);
    }

    private Long parseId(String raw, String fieldName) {
        try {
            return Long.parseLong(raw);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid " + fieldName);
        }
    }

    private int checkPageIndex(Integer pageToken){
        if(pageToken == null || pageToken < 0)
            return 0;
        return pageToken;
    }

    public Page<BookingEntity> getBookings(PageRequest pageRequest) {
        return bookingRepository.findAll(pageRequest);
    }
    public Page<BookingEntity> getBookings(PageRequest pageRequest, String search) {
        // TODO: Implement
        return bookingRepository.findAll(pageRequest);
    }
    public Optional<BookingEntity> getBookingById(long id) {
        return bookingRepository.findById(id);
    }

    public boolean canBookingBeMarkedAsPaid(BookingEntity booking) {
        return booking.getPaymentInfo().getStatus() == PaymentStatus.pendingPayment;
    }
    public boolean canBookingBeMarkedAsRefunded(BookingEntity booking) {
        return booking.getPaymentInfo().getStatus() == PaymentStatus.pendingRefund;
    }

    @Transactional
    public void markBookingAsPaid(BookingEntity booking){
        var pi = booking.getPaymentInfo();
        if(pi.getStatus() != PaymentStatus.pendingPayment) {
            throw new ActionNotAllowedException("Only a booking with pending payment can be marked as paid");
        }
        booking.getPaymentInfo().setStatus(PaymentStatus.received);
        booking.getPaymentInfo().setPaidAt(Instant.now());
        paymentRepository.save(booking.getPaymentInfo());
        bookingRepository.save(booking);
    }

    @Transactional
    public void markBookingAsRefunded(BookingEntity booking){
        var pi = booking.getPaymentInfo();
        if(pi.getStatus() != PaymentStatus.pendingRefund) {
            throw new ActionNotAllowedException("Only a booking with a pending refund can be marked as refunded");
        }
        booking.getPaymentInfo().setStatus(PaymentStatus.refunded);
        paymentRepository.save(booking.getPaymentInfo());
        bookingRepository.save(booking);
    }
}
