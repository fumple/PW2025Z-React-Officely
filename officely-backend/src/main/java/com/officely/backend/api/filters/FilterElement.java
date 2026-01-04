package com.officely.backend.api.filters;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class FilterElement {
    private String key;
    private String label;
    private String type;

    private List<FilterFlag> flags;

    private Integer min;
    private Integer max;

    public FilterElement(String key, String label, String type){
        this.key = key;
        this.label = label;
        this.type = type;
    }

    public String getKey() {return key;}
    public void setKey(String key) {this.key = key;}

    public String getLabel() {return label;}
    public void setLabel(String label) {this.label = label;}

    public String getType() {return type;}
    public void setType(String type) {this.type = type;}

    public List<FilterFlag> getFlags() {return flags;}
    public void setFlags(List<FilterFlag> flags) {this.flags = flags;}

    public Integer getMin() {return min;}
    public void setMin(Integer min) {this.min = min;}

    public Integer getMax() {return max;}
    public void setMax(Integer max) {this.max = max;}
}
