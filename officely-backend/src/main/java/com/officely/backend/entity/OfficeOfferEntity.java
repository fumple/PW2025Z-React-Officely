package com.officely.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name="office_offers")
public class OfficeOfferEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "office_id", nullable = false)
    private OfficeEntity office;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name="item_id", nullable=false)
    private OfficeItemEntity item;

    @Column(nullable = false)
    private String name;

    @Column(name = "price_per_day", nullable = false)
    private Integer pricePerDay;

    @Column(name = "free_cancellation_hours", nullable = false)
    private Integer freeCancellationHours;

    @Column(name = "payment_hours", nullable = false)
    private Integer paymentHours;

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

    public Long getId() { return id; }

    public OfficeEntity getOffice() { return office; }
    public void setOffice(OfficeEntity office) { this.office = office; }

    public OfficeItemEntity getItem() { return item; }
    public void setItem(OfficeItemEntity item) { this.item = item;}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getPricePerDay() { return pricePerDay; }
    public void setPricePerDay(Integer pricePerDay) { this.pricePerDay = pricePerDay; }

    public Integer getFreeCancellationHours() { return freeCancellationHours; }
    public void setFreeCancellationHours(Integer freeCancellationHours) { this.freeCancellationHours = freeCancellationHours; }

    public Integer getPaymentHours() { return paymentHours; }
    public void setPaymentHours(Integer paymentHours) { this.paymentHours = paymentHours; }

}
