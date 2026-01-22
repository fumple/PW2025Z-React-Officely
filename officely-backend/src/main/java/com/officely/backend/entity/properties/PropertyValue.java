package com.officely.backend.entity.properties;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public abstract class PropertyValue {
    private String section;
    private String element;

    public abstract String getKey();
    public abstract String getSerializedValue();
}
