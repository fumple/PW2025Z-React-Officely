package com.officely.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.officely.backend.api.filters.FilterElementDto;
import jakarta.annotation.PostConstruct;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import com.officely.backend.api.filters.FilterSectionDto;

import java.io.InputStream;
import java.util.List;
import java.util.Optional;

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
    public Optional<FilterElementDto> getFilter(String key) {
        var parts = key.split("\\.", 3);
        if(parts.length <= 1) {
            return Optional.empty();
        }
        var filters = getFilters();
        var sectionOpt = filters.stream().filter(e -> e.getKey().equals(parts[0])).findFirst();
        if(sectionOpt.isEmpty())
            return Optional.empty();
        var section = sectionOpt.get();
        return section.getElements().stream().filter(e -> e.getKey().equals(parts[1])).findFirst();
    }
}
