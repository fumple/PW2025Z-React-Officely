package com.officely.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;

@Getter
@Entity
@Table(name="bookings")
public class BookingEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @Setter
    @ManyToOne(optional = false)
    @JoinColumn(name = "office_id")
    private OfficeEntity office;

    @Setter
    @ManyToOne(optional = false)
    @JoinColumn(name = "offer_id")
    private OfficeOfferEntity offer;

    @Setter
    @ManyToOne(optional = false)
    @JoinColumn(name="item_id", nullable=false)
    private OfficeItemEntity item;

    @Setter
    @Enumerated(EnumType.STRING)
    @Column(name = "booking_status", nullable = false)
    private BookingStatus bookingStatus;

    @Setter
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Setter
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Setter
    @Column(name = "creation_date", nullable = false)
    private Instant creationDate;

    @Setter
    @Column(name = "total_price", nullable = false)
    private int totalPrice;

    @Setter
    @OneToOne(mappedBy = "booking")
    private PaymentEntity paymentInfo;

    @Setter
    @Column(length = 64)
    private String cancellationReason;

    public BookingEntity() {}

    public BookingEntity(
            UserEntity user,
            OfficeEntity office,
            OfficeOfferEntity offer,
            OfficeItemEntity item,
            BookingStatus status,
            LocalDate startDate,
            LocalDate endDate,
            Instant creationDate,
            Integer totalPrice
    ) {
        this.user = user;
        this.office = office;
        this.offer = offer;
        this.item = item;
        this.bookingStatus = status;
        this.startDate = startDate;
        this.endDate = endDate;
        this.creationDate = creationDate;
        this.totalPrice = totalPrice;
    }
}
