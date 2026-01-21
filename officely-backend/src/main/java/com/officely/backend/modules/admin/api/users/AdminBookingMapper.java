package com.officely.backend.modules.admin.api.users;

import com.officely.backend.entity.BookingEntity;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE)
public abstract class AdminBookingMapper {
    public abstract BookingDto bookingToBookingDto(BookingEntity entity);
}
