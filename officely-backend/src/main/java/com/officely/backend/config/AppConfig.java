package com.officely.backend.config;

import lombok.NonNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import static java.util.stream.Collectors.toSet;

@Configuration
public class AppConfig {

    private final String corsUrls;
    private final String corsMappings;

    public AppConfig(@Value(value = "${cors.urls}") String corsUrls,
                      @Value(value = "${cors.mappings}") String corsMappings) {
        this.corsUrls = corsUrls;
        this.corsMappings = corsMappings;
    }

    @Bean
    public RestTemplate restTemplate(){
        return new RestTemplate();
    }

    private String[] getCorsUrls() {
        return Optional.ofNullable(corsUrls)
                .map(value -> value.split(","))
                .orElseGet(() -> new String[0]);
    }

    private Set<String> getCorsMappings() {
        return Optional.ofNullable(corsMappings)
                .map(value -> Arrays.stream(value.split(",")))
                .map(stream -> stream.collect(toSet()))
                .orElseGet(HashSet::new);
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(@NonNull CorsRegistry registry) {
                final Set<String> mappings = getCorsMappings();
                if (mappings.isEmpty()) {
                    registry.addMapping("/**");
                } else {
                    for (String mapping : mappings) {
                        registry
                                .addMapping(mapping)
                                .allowedOrigins(getCorsUrls())
                                .allowedMethods("*");

                    }
                }
            }
        };
    }
}
