package com.officely.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.HashMap;
import java.util.Map;

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
    @Column(nullable = false)
    private String name;

    @Setter
    @Column()
    private String publicName;

    @Setter
    @Column(nullable = false)
    private boolean available = false;

    @Setter
    @Column(name = "price_per_day", nullable = false)
    private Integer pricePerDay;

    @Setter
    @Column(name = "free_cancellation_hours", nullable = false)
    private Integer freeCancellationHours;

    @Setter
    @Column(name = "payment_hours", nullable = false)
    private Integer paymentHours;

    @Column(nullable = false, columnDefinition = "JSON")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, String> properties = new HashMap<>();
}
