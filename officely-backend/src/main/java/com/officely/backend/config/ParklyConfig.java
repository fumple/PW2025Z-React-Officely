package com.officely.backend.config;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

@Component
@ConfigurationProperties(prefix = "parkly")
@Validated
public class ParklyConfig {
    @Getter @Setter
    @NotNull
    private String baseUrl;
}