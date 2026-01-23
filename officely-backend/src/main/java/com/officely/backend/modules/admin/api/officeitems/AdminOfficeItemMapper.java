package com.officely.backend.modules.admin.api.officeitems;

import com.officely.backend.entity.OfficeItemEntity;
import org.mapstruct.*;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE)
public abstract class AdminOfficeItemMapper {
    @Mapping(source = "office.id", target = "officeId")
    @Mapping(source = "offer.id", target = "offerId")
    public abstract OfficeItemDto officeItemToOfficeItemDto(OfficeItemEntity entity);
    public abstract OfficeItemEntity officeItemPostRequestToOfficeItem(OfficeItemPostRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    public abstract void update(OfficeItemPatchRequest request, @MappingTarget OfficeItemEntity updated);
}
