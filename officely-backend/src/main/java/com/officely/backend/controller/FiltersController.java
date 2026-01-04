package com.officely.backend.controller;

import com.officely.backend.api.filters.FilterSection;
import com.officely.backend.service.FiltersService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/filters")
public class FiltersController {
    private final FiltersService filtersService;

    public FiltersController(FiltersService filtersService) { this.filtersService = filtersService; }

    @GetMapping
    public List<FilterSection> getFilters(){
        return filtersService.getFilters();
    }
}

