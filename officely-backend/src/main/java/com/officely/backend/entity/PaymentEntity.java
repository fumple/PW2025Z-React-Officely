package com.officely.backend.entity;

import jakarta.persistence.*;
import jakarta.persistence.criteria.CriteriaBuilder;

import java.awt.print.Book;
import java.time.Instant;

@Entity
@Table(name = "payments")
public class PaymentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private BookingEntity booking;

    @Column(name = "account_number", nullable = false)
    private String accountNumber;

    @Column(name = "receiver_name", nullable = false)
    private String receiverName;

    @Column(name = "transfer_title", nullable = false)
    private String transferTitle;

    @Column(name = "due_date", nullable = false)
    private Instant dueDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PaymentStatus status;

    @Column(name = "paid_at")
    private Instant paidAt;

    public PaymentEntity() {}

    public PaymentEntity(BookingEntity booking, String accountNumber, String receiverName,
                         String transferTitle, Instant dueDate, PaymentStatus status) {
        this.booking = booking;
        this.accountNumber = accountNumber;
        this.receiverName = receiverName;
        this.transferTitle = transferTitle;
        this.dueDate = dueDate;
        this.status = status;
    }

    public Long getId() { return id; }

    public BookingEntity getBooking() { return booking; }
    public void setBooking(BookingEntity booking) { this.booking = booking; }

    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }

    public String getReceiverName() { return receiverName; }
    public void setReceiverName(String receiverName) { this.receiverName = receiverName; }

    public String getTransferTitle() { return transferTitle; }
    public void setTransferTitle(String transferTitle) { this.transferTitle = transferTitle; }

    public Instant getDueDate() { return dueDate; }
    public void setDueDate(Instant dueDate) { this.dueDate = dueDate; }

    public PaymentStatus getStatus() { return status; }
    public void setStatus(PaymentStatus status) { this.status = status; }

    public Instant getPaidAt() { return paidAt; }
    public void setPaidAt(Instant paidAt) { this.paidAt = paidAt; }
}
