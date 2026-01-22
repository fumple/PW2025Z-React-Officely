package com.officely.backend.modules.admin.api.users.officeoffers;

import com.officely.backend.api.PhotosToStringsMapper;
import com.officely.backend.api.throwables.ValidationException;
import com.officely.backend.entity.OfficeOfferEntity;
import com.officely.backend.entity.properties.FlagPropertyValue;
import com.officely.backend.entity.properties.IntegerPropertyValue;
import com.officely.backend.entity.properties.PropertyValue;
import com.officely.backend.service.FiltersService;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = "spring")
public abstract class AdminOfficeOfferMapper {
    @Autowired
    protected FiltersService filtersService;

    public abstract OfficeOfferDto officeOfferToOfficeOfferDto(OfficeOfferEntity entity);
    public abstract OfficeOfferEntity officeOfferPostRequestToOfficeOffer(OfficeOfferPostRequest request);

    @AfterMapping
    protected void mapPhotos(@MappingTarget OfficeOfferDto target, OfficeOfferEntity source) {
        target.setPhotoUrls(PhotosToStringsMapper.mapOfficeOfferPhotos(source.getPhotos()));
    }

    protected Map<String,String> map(List<PropertyValue> value) {
        var result = new HashMap<String, String>();
        for(var v : value) {
            result.put(v.getKey(), v.getSerializedValue());
        }
        return result;
    }

    protected List<PropertyValue> map(Map<String, String> value) {
        var result = new ArrayList<PropertyValue>();
        for(var v : value.entrySet()) {
            var filter = filtersService.getFilter(v.getKey()).orElseThrow(() -> new ValidationException("properties", "A filter from the list was not found"));
            if(filter.getType().equals("integer")) {
                if(v.getKey().chars().filter(e -> e == '.').count() != 1) {
                    throw new ValidationException("properties", "A filter was incorrectly formatted");
                }
                var parts = v.getKey().split("\\.", 2);
                try {
                    var num = Integer.parseInt(v.getValue());
                    var prop = new IntegerPropertyValue();
                    prop.setSection(parts[0]);
                    prop.setElement(parts[1]);
                    prop.setValue(num);
                    result.add(prop);
                } catch (NumberFormatException e) {
                    throw new ValidationException("properties", "Expected an integer value for "+v.getKey());
                }
            } else if(filter.getType().equals("flags")) {
                if(v.getKey().chars().filter(e -> e == '.').count() != 2) {
                    throw new ValidationException("properties", "A filter was incorrectly formatted");
                }
                if(!v.getValue().equals("true")){
                    throw new ValidationException("properties", "Expected a \"true\" value for "+v.getKey());
                }
                var parts = v.getKey().split("\\.", 3);
                if(filter.getFlags().stream().filter(e -> e.getKey().equals(parts[2])).findFirst().isEmpty()) {
                    throw new ValidationException("properties", "Flag "+parts[2]+" was not found!");
                }
                var prop = new FlagPropertyValue();
                prop.setSection(parts[0]);
                prop.setElement(parts[1]);
                prop.setFlag(parts[2]);
                result.add(prop);
            }
        }
        return result;
    }
}
