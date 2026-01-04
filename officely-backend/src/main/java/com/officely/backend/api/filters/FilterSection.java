package com.officely.backend.api.filters;

import java.util.List;

public class FilterSection {
    private String key;
    private String label;
    private List<FilterElement> elements;

    public FilterSection(String key, String label, List<FilterElement> elements){
        this.key = key;
        this.label = label;
        this.elements = elements;
    }

    public String getKey() {return key;}
    public void setKey(String key) {this.key = key;}

    public String getLabel() {return label;}
    public void setLabel(String label) {this.label = label;}

    public List<FilterElement> getElements() {return elements;}
    public void setElements(List<FilterElement> elements) {this.elements = elements;}
}
