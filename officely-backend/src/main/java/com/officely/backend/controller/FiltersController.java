package com.officely.backend.controller;

import com.officely.backend.api.filters.FiltersResponseDto;
import com.officely.backend.service.FiltersService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/filters")
public class FiltersController {
    private final FiltersService filtersService;

    public FiltersController(FiltersService filtersService) { this.filtersService = filtersService; }

    @GetMapping
    public FiltersResponseDto getFilters(){
        FiltersResponseDto response = new FiltersResponseDto();
        response.setFilters(filtersService.getFilters());

        FiltersResponseDto.Links links = new FiltersResponseDto.Links();
        links.setSelf("/filters");
        response.setLinks(links);

        return response;
    }
}

