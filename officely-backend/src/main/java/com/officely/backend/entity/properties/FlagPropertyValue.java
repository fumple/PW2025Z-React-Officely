package com.officely.backend.entity.properties;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FlagPropertyValue extends PropertyValue {
    private String flag;


    @Override
    public String getKey() {
        return this.getSection()+"."+this.getElement()+"."+this.getFlag();
    }

    @Override
    public String getSerializedValue() {
        return "true";
    }
}
