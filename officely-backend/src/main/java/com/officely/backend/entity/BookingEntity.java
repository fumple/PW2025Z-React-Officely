package com.officely.backend.entity;

import jakarta.persistence.*;
import jakarta.persistence.criteria.CriteriaBuilder;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name="bookings")
public class BookingEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @ManyToOne(optional = false)
    @JoinColumn(name = "office_id")
    private OfficeEntity office;

    @ManyToOne(optional = false)
    @JoinColumn(name = "offer_id")
    private OfficeOfferEntity offer;

    @ManyToOne(optional = false)
    @JoinColumn(name="item_id", nullable=false)
    private OfficeItemEntity item;

    @Enumerated(EnumType.STRING)
    @Column(name = "booking_status", nullable = false)
    private BookingStatus bookingStatus;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "creation_date", nullable = false)
    private Instant creationDate;

    @Column(name = "total_price", nullable = false)
    private Integer totalPrice;

    @OneToOne(mappedBy = "booking",fetch = FetchType.LAZY)
    private PaymentEntity paymentInfo;

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

    public Long getId() { return id; }

    public UserEntity getUser() { return user; }
    public void setUser(UserEntity user) { this.user = user; }

    public OfficeEntity getOffice() { return office; }
    public void setOffice(OfficeEntity office) { this.office = office; }

    public OfficeOfferEntity getOffer() { return offer; }
    public void setOffer(OfficeOfferEntity offer) { this.offer = offer; }

    public OfficeItemEntity getItem() { return item; }
    public void setItem(OfficeItemEntity item) { this.item = item; }

    public BookingStatus getBookingStatus() { return bookingStatus; }
    public void setBookingStatus(BookingStatus status) { this.bookingStatus = status; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public Instant getCreationDate() { return creationDate; }
    public void setCreationDate(Instant creationDate) { this.creationDate = creationDate; }

    public Integer getTotalPrice() { return totalPrice; }
    public void setTotalPrice(Integer totalPrice) { this.totalPrice = totalPrice; }

    public PaymentEntity getPaymentInfo() { return paymentInfo; }
    public void setPayment(PaymentEntity paymentInfo) { this.paymentInfo = paymentInfo; }
}
