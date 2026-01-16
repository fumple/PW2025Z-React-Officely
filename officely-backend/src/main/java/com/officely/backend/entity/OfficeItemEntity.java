package com.officely.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "office_items")
public class OfficeItemEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "office_id", nullable = false)
    private OfficeEntity office;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 2000)
    private String description;

    @Column(nullable = false)
    private Integer floor;

    @Column(nullable = false)
    private String room;

    public OfficeItemEntity() {}

    public Long getId() { return id; }

    public OfficeEntity getOffice() { return office; }
    public void setOffice(OfficeEntity office) { this.office = office; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getFloor() { return floor; }
    public void setFloor(Integer floor) { this.floor = floor; }

    public String getRoom() { return room; }
    public void setRoom(String room) { this.room = room; }
}
