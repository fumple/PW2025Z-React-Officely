package com.officely.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "office_photos")
public class OfficePhotoEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String url;

    @ManyToOne
    @JoinColumn(name = "office_id")
    private OfficeEntity office;

    public Long getId() { return id; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public OfficeEntity getOffice() { return office; }
    public void setOffice(OfficeEntity office) { this.office = office; }
}
