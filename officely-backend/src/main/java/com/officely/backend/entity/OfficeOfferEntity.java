package com.officely.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name="office_offers")
@Getter
public class OfficeOfferEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "office_id", nullable = false)
    private OfficeEntity office;

    @Setter
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name="item_id", nullable=false)
    private OfficeItemEntity item;

    @Setter
    @Column(nullable = false)
    private String name;

    @Setter
    @Column(name = "price_per_day", nullable = false)
    private Integer pricePerDay;

    @Setter
    @Column(name = "free_cancellation_hours", nullable = false)
    private Integer freeCancellationHours;

    @Setter
    @Column(name = "payment_hours", nullable = false)
    private Integer paymentHours;

    // workspace type - desk/room(?)
    @Enumerated(EnumType.STRING)
    @Column(name = "workspace_type", nullable = false)
    private WorkspaceType workspaceType;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "office_features", joinColumns = @JoinColumn(name = "office_id"))
    @Column(name = "feature_key")
    private Set<String> features = new HashSet<>();

    public OfficeOfferEntity() {}

    public OfficeOfferEntity(Long id, OfficeEntity office, OfficeItemEntity item, String name, Integer pricePerDay, Integer freeCancellationHours, Integer paymentHours){
        this.id = id;
        this.office = office;
        this.item = item;
        this.name = name;
        this.pricePerDay = pricePerDay;
        this.freeCancellationHours = freeCancellationHours;
        this.paymentHours = paymentHours;
    }
}
