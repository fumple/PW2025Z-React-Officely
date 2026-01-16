package com.officely.backend.flatly.controller;

import com.officely.backend.service.AuthenticationService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Objects;

@Component
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class FlatlyAuthFilter extends OncePerRequestFilter {
    private final AuthenticationService authService;

    private boolean validate(HttpServletRequest request) {
        var header = request.getHeader("Authorization");
        if(!header.startsWith("Bearer ")){
            return false;
        }
        var token = header.substring("Bearer ".length());
        return authService.checkFlatlyToken(token);
    }
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        if(!validate(request)) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        var ctx = RequestContextHolder.getRequestAttributes();
        Objects.requireNonNull(ctx);
        ctx.setAttribute("flatly", true, RequestAttributes.SCOPE_REQUEST);
        RequestContextHolder.setRequestAttributes(ctx);

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        var path = request.getRequestURI();
        return !path.startsWith("/flatly");
    }
}
