package com.officely.backend.modules.admin.api.officeoffers;

import com.officely.backend.entity.OfficeOfferEntity;
import org.mapstruct.*;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = "spring")
public abstract class AdminOfficeOfferMapper {
    @Mapping(source = "office.id", target = "officeId")
    public abstract OfficeOfferDto officeOfferToOfficeOfferDto(OfficeOfferEntity entity);
    public abstract OfficeOfferEntity officeOfferPostRequestToOfficeOffer(OfficeOfferPostRequest request);
}
