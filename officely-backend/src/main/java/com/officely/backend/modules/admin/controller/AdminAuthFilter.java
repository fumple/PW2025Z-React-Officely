package com.officely.backend.modules.admin.controller;

import com.officely.backend.entity.UserEntity;
import com.officely.backend.service.AuthenticationService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Optional;

@Component
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class AdminAuthFilter extends OncePerRequestFilter {
    private final AuthenticationService authService;

    private Optional<UserEntity> validate(HttpServletRequest request) {
        var header = request.getHeader("Authorization");
        if(header == null || !header.startsWith("Bearer ")){
            return Optional.empty();
        }
        var token = header.substring("Bearer ".length());
        return authService.checkAdminToken(token);
    }
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        var result = validate(request);
        if(result.isEmpty()) {
            filterChain.doFilter(request, response);
            return;
        }
        var user = result.get();
        var authorities = new ArrayList<SimpleGrantedAuthority>();
        authorities.add(new SimpleGrantedAuthority("ADMIN"));
        if(user.isAdmin())
            authorities.add(new SimpleGrantedAuthority("ROLE_FULL_ACCESS"));

        var authentication = new UsernamePasswordAuthenticationToken(user, null, authorities);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getServletPath().startsWith("/admin");
    }
}
