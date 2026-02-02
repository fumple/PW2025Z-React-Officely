package com.officely.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Entity
@Table(name = "office_photos")
public class OfficePhotoEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @Column(name = "url", length = 128)
    private String filename;

    @Setter
    @ManyToOne
    @JoinColumn(name = "office_id")
    private OfficeEntity office;
}
