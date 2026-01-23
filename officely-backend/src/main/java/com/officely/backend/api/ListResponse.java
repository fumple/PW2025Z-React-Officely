package com.officely.backend.api;

import lombok.Getter;
import lombok.Setter;
import org.springframework.hateoas.RepresentationModel;

import java.util.List;

@Getter
@Setter
public class ListResponse<T> extends RepresentationModel<ListResponse<T>> {
    private List<T> results;
}
