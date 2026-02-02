package com.officely.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Entity
@Table(name = "payments")
public class PaymentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @OneToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private BookingEntity booking;

    @Setter
    @Column(name = "account_number", nullable = false, length = 34)
    private String accountNumber;

    @Setter
    @Column(name = "receiver_name", nullable = false, length = 64)
    private String receiverName;

    @Setter
    @Column(name = "transfer_title", nullable = false, length = 64)
    private String transferTitle;

    @Setter
    @Column(name = "due_date", nullable = false)
    private Instant dueDate;

    @Setter
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PaymentStatus status;

    @Setter
    @Column(name = "paid_at")
    private Instant paidAt;

}
