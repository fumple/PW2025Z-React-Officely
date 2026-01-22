package com.officely.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Entity
@Table(name = "office_offer_photos")
public class OfficeOfferPhotoEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @Column(name = "filename")
    private String filename;

    @Setter
    @ManyToOne
    @JoinColumn(name = "office_offer_id")
    private OfficeOfferEntity offer;
}
