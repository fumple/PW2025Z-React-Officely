package com.officely.backend.modules.admin.api.bookings;

import com.officely.backend.entity.BookingEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE)
public abstract class AdminBookingMapper {
    @Mapping(source = "office.id", target = "officeId")
    @Mapping(source = "item.id", target = "itemId")
    @Mapping(source = "offer.id", target = "offerId")
    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "bookingStatus", target = "status")
    public abstract BookingDto bookingToBookingDto(BookingEntity entity);
}
