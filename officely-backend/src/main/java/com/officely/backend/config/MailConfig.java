package com.officely.backend.config;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

import java.util.List;

@Component
@ConfigurationProperties(prefix = "mail")
@Validated
@Getter
@Setter
public class MailConfig {
    @NotNull
    private String host;
    @NotNull
    private String from;
    @NotNull
    private List<String> domainWhitelist;
}
