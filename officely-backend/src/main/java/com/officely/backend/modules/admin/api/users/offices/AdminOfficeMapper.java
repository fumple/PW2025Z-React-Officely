package com.officely.backend.modules.admin.api.users.offices;

import com.officely.backend.api.PhotosToStringsMapper;
import com.officely.backend.entity.OfficeEntity;
import org.mapstruct.*;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE)
public abstract class AdminOfficeMapper {
    @Mapping(source = "latitude", target = "coordinates.lat")
    @Mapping(source = "longitude", target = "coordinates.lon")
    @Mapping(source = "owner.id", target = "ownerId")
    public abstract OfficeDto officeToOfficeDto(OfficeEntity entity);
    public abstract OfficeEntity officePostRequestToOffice(OfficePostRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    public abstract void update(OfficePatchRequest request, @MappingTarget OfficeEntity updated);

    @AfterMapping
    protected void mapPhotos(@MappingTarget OfficeDto target, OfficeEntity source) {
        target.setPhotoUrls(PhotosToStringsMapper.mapOfficePhotos(source.getPhotos()));
    }
}
