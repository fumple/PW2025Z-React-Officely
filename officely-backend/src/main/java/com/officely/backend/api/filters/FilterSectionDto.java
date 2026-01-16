package com.officely.backend.api.filters;

import java.util.List;

public class FilterSectionDto {
    private String key;
    private String label;
    private List<FilterElementDto> elements;

    public FilterSectionDto() {}

    public FilterSectionDto(String key, String label, List<FilterElementDto> elements){
        this.key = key;
        this.label = label;
        this.elements = elements;
    }

    public String getKey() {return key;}
    public void setKey(String key) {this.key = key;}

    public String getLabel() {return label;}
    public void setLabel(String label) {this.label = label;}

    public List<FilterElementDto> getElements() {return elements;}
    public void setElements(List<FilterElementDto> elements) {this.elements = elements;}
}
