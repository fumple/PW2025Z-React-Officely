package com.officely.backend.entity;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

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

    @Column(name="min_price", nullable = false)
    private Integer minPrice;

    @Column(name="max_price", nullable = false)
    private Integer maxPrice;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @OneToMany(mappedBy = "office")
    private List<OfficePhotoEntity> photos = new ArrayList<>();

    // workspace type - desk/room(?)
    @Enumerated(EnumType.STRING)
    @Column(name = "workspace_type", nullable = false)
    private WorkspaceType workspaceType;

    // amenities
    @Column(nullable = false)
    private Boolean wifi = false;

    @Column(nullable = false)
    private Boolean access24h = false;

    @Column(nullable = false)
    private Boolean kitchen = false;

    @Column(nullable = false)
    private Boolean parking = false;

    @Column(name = "wheelchair_accessible", nullable = false)
    private Boolean wheelchairAccessible = false;

    // environment
    @Column(nullable = false)
    private Boolean quiet = false;

    @Column(nullable = false)
    private Boolean social = false;

    // equipment
    @Column(nullable = false)
    private Boolean monitor = false;

    @Column(nullable = false)
    private Boolean printer = false;

    public Long getId() {return id;}
    public void setId(Long id) {this.id = id;}

    public String getName() {return name;}
    public void setName(String name) {this.name = name;}

    public String getDescription() {return description;}
    public void setDescription(String description) {this.description = description;}

    public String getAddress() {return address;}
    public void setAddress(String address) {this.address = address;}

    public Integer getMinPrice() { return minPrice; }
    public void setMinPrice(Integer minPrice) { this.minPrice = minPrice; }

    public Integer getMaxPrice() { return maxPrice; }
    public void setMaxPrice(Integer maxPrice) { this.maxPrice = maxPrice; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public List<OfficePhotoEntity> getPhotos() { return photos; }
    public void setPhotos(List<OfficePhotoEntity> photos) { this.photos = photos; }

    public WorkspaceType getWorkspaceType() {return workspaceType;}
    public void setWorkspaceType(WorkspaceType workspaceType) {this.workspaceType = workspaceType;}

    public Boolean getWifi() {return wifi;}
    public void setWifi(Boolean wifi) {this.wifi = wifi;}

    public Boolean getAccess24h() {return access24h;}
    public void setAccess24h(Boolean access24h) {this.access24h = access24h;}

    public Boolean getKitchen() {return kitchen;}
    public void setKitchen(Boolean kitchen) {this.kitchen = kitchen;}

    public Boolean getParking() {return parking;}
    public void setParking(Boolean parking) {this.parking = parking;}

    public Boolean getWheelchairAccessible() {return wheelchairAccessible;}
    public void setWheelchairAccessible(Boolean wheelchairAccessible) {this.wheelchairAccessible = wheelchairAccessible;}

    public Boolean getQuiet() {return quiet;}
    public void setQuiet(Boolean quiet) {this.quiet = quiet;}

    public Boolean getSocial() {return social;}
    public void setSocial(Boolean social) {this.social = social;}

    public Boolean getMonitor() {return monitor;}
    public void setMonitor(Boolean monitor) {this.monitor = monitor;}

    public Boolean getPrinter() {return printer;}
    public void setPrinter(Boolean printer) {this.printer = printer;}
}
