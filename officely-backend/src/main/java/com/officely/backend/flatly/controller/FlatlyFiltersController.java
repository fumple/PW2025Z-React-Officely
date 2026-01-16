package com.officely.backend.flatly.controller;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;

import com.officely.backend.api.filters.FiltersResponseDto;
import com.officely.backend.service.FiltersService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/flatly/filters")
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class FlatlyFiltersController {
    private final FiltersService filtersService;

    @GetMapping
    public FiltersResponseDto getFilters(){
        var response = new FiltersResponseDto();
        response.setFilters(filtersService.getFilters());
        response.add(linkTo(FlatlyFiltersController.class).withSelfRel());

        return response;
    }
}
