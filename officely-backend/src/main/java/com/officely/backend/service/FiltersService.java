package com.officely.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import com.officely.backend.api.filters.FilterSectionDto;

import java.io.InputStream;
import java.util.List;

@Service
public class FiltersService {
    private final ObjectMapper objectMapper;
    private List<FilterSectionDto> cached;

    public FiltersService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    void load() {
        try (InputStream inputStream = new ClassPathResource("filters/filters.json").getInputStream()) {
            cached = objectMapper.readValue(inputStream, new TypeReference<List<FilterSectionDto>>() {});
        } catch (Exception e) {
            throw new IllegalStateException("Failed to load filters from classpath: filters/filters.json", e);
        }
    }

    public List<FilterSectionDto> getFilters() {
        return cached;
    }
}
