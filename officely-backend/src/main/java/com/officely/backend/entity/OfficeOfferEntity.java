package com.officely.backend.entity;

import com.officely.backend.entity.properties.PropertyValue;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.ArrayList;
import java.util.List;

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

    // workspace type - desk/room(?)
    @Enumerated(EnumType.STRING)
    @Column(name = "workspace_type", nullable = false)
    private WorkspaceType workspaceType;

    @Column(nullable = false, columnDefinition = "JSON")
    @JdbcTypeCode(SqlTypes.JSON_ARRAY)
    private List<PropertyValue> properties = new ArrayList<>();
}
