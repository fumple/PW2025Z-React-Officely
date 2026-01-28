package com.officely.backend.config;

import com.officely.backend.modules.admin.controller.AdminAuthFilter;
import com.officely.backend.modules.flatly.controller.FlatlyAuthFilter;
import com.officely.backend.modules.mobile.controller.MobileAuthFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Autowired
    private AdminAuthFilter adminAuthFilter;
    @Autowired
    private FlatlyAuthFilter flatlyAuthFilter;
    @Autowired
    private MobileAuthFilter mobileAuthFilter;

    private final String corsOrigins;

    public SecurityConfig(@Value(value = "${cors.origins}") String corsOrigins) {
        this.corsOrigins = corsOrigins;
    }

    private String[] getCorsOrigins() {
        return Optional.ofNullable(corsOrigins)
                .map(value -> value.split(","))
                .orElseGet(() -> new String[0]);
    }

    UrlBasedCorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.stream(getCorsOrigins()).toList());
        configuration.setAllowedMethods(List.of("*"));
        configuration.setAllowedHeaders(List.of("*"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors((cors) -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/uploads/**")
                        .permitAll()
                        .requestMatchers("/error")
                        .permitAll()
                        .requestMatchers("/flatly/**")
                        .hasAuthority("FLATLY")
                        .requestMatchers("/admin/login", "/admin/filters", "/admin/signup", "/admin/resetPassword", "/admin/checkResetCode", "/admin/resetPasswordEmail")
                        .permitAll()
                        .requestMatchers("/admin/**")
                        .hasAuthority("ADMIN")
                        .requestMatchers("/mobile/login", "/mobile/signup", "/mobile/resetPassword", "/mobile/checkResetCode", "/mobile/resetPasswordEmail")
                        .permitAll()
                        .requestMatchers("/mobile/**")
                        .hasAuthority("LOCAL_CUSTOMER")
                )
                .anonymous(AbstractHttpConfigurer::disable)
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                )
                .addFilterBefore(adminAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(flatlyAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(mobileAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return new InMemoryUserDetailsManager();
    }
}
