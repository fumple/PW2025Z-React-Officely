package com.officely.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name="offices")
@Getter
public class OfficeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private UserEntity owner;

    @Setter
    @Column(nullable = false, length = 64)
    private String name;

    @Setter
    @Column(columnDefinition = "TEXT", length = 4096)
    private String description;

    @Setter
    @Column(nullable = false, length = 256)
    private String address;

    @Setter
    @Column(nullable = false)
    private double latitude;

    @Setter
    @Column(nullable = false)
    private double longitude;

    @Setter
    @OneToMany(mappedBy = "office")
    private List<OfficePhotoEntity> photos = new ArrayList<>();

    @Setter
    @OneToMany(mappedBy = "office", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OfficeMemberEntity> members = new ArrayList<>();

    @Setter
    @OneToMany(mappedBy = "office", cascade = CascadeType.ALL)
    private List<OfficeOfferEntity> offers;

    @Setter
    @OneToMany(mappedBy = "office")
    private List<BookingEntity> bookings;

    @Setter
    @OneToMany(mappedBy = "office", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OfficeItemEntity> items;

    @Setter
    @Column(nullable = false, length = 256)
    private String contactEmail;

    @Setter
    @Column(nullable = false, length = 16)
    private String contactPhone;

    @Setter
    @Column(nullable = false, length = 34)
    private String paymentAccountNumber;

    @Setter
    @Column(nullable = false, length = 64)
    private String paymentReceiverName;

    @Setter
    @Column(nullable = false)
    private boolean published = false;
}
