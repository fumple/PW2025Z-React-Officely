package com.officely.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Entity
@Table(name = "office_items")
public class OfficeItemEntity {
    public enum Types {
        SHARED,
        INDIVIDUAL
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "office_id", nullable = false)
    private OfficeEntity office;

    @Setter
    @Column(nullable = false, length = 64)
    private String name;

    @Setter
    @Column(nullable = false, length = 8)
    private String floor;

    @Setter
    @Column(nullable = false, length = 16)
    private String room;

    @Setter
    @Column(nullable = false)
    private Types type;

    @Setter
    @Column(nullable = false)
    private int capacity;

    @Setter
    @Column(nullable = false)
    private boolean available = true;

    @Setter
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name="offer_id", nullable=false)
    private OfficeOfferEntity offer;
}
