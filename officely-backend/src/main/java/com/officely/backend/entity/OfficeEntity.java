package com.officely.backend.entity;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name="offices")
public class OfficeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @OneToMany(mappedBy = "office")
    private List<OfficePhotoEntity> photos = new ArrayList<>();

    @OneToMany(mappedBy = "office", cascade = CascadeType.ALL)
    private List<OfficeOfferEntity> offers;

    @OneToMany(mappedBy = "office")
    private List<BookingEntity> bookings;

    @OneToMany(mappedBy = "office", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OfficeItemEntity> items;

    @Column(nullable = false)
    private String contactEmail;

    @Column(nullable = false)
    private String contactPhone;

    // workspace type - desk/room(?)
    @Enumerated(EnumType.STRING)
    @Column(name = "workspace_type", nullable = false)
    private WorkspaceType workspaceType;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "office_features", joinColumns = @JoinColumn(name = "office_id"))
    @Column(name = "feature_key")
    private Set<String> features = new HashSet<>();

    public Long getId() {return id;}

    public String getName() {return name;}
    public void setName(String name) {this.name = name;}

    public String getDescription() {return description;}
    public void setDescription(String description) {this.description = description;}

    public String getAddress() {return address;}
    public void setAddress(String address) {this.address = address;}

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public List<OfficePhotoEntity> getPhotos() { return photos; }
    public void setPhotos(List<OfficePhotoEntity> photos) { this.photos = photos; }

    public List<OfficeOfferEntity> getOffers() { return offers; }
    public void setOffers(List<OfficeOfferEntity> offers) { this.offers = offers; }

    public List<BookingEntity> getBookings() { return bookings; }
    public void setBookings(List<BookingEntity> bookings) { this.bookings = bookings; }

    public List<OfficeItemEntity> getItems() { return items; }
    public void setItems(List<OfficeItemEntity> items) { this.items = items; }

    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
}
