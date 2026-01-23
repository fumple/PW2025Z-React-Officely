package com.officely.backend.modules.admin.api.officeoffers;

import com.officely.backend.entity.OfficeOfferEntity;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = "spring")
public abstract class AdminOfficeOfferMapper {
    public abstract OfficeOfferDto officeOfferToOfficeOfferDto(OfficeOfferEntity entity);
    public abstract OfficeOfferEntity officeOfferPostRequestToOfficeOffer(OfficeOfferPostRequest request);
}
