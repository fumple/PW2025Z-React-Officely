package com.officely.backend.entity.properties;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class IntegerPropertyValue extends PropertyValue {
    private int value;

    public String getKey() {
        return this.getSection()+"."+this.getElement();
    }
    public String getSerializedValue() {
        return String.valueOf(value);
    }
}
