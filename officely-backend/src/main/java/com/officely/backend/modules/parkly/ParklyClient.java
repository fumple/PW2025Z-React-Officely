package com.officely.backend.modules.parkly;

import com.officely.backend.config.ParklyConfig;
import com.officely.backend.modules.parkly.api.*;
import org.springframework.http.*;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ParklyClient {
    private final RestTemplate restTemplate;
    private final ParklyConfig parklyConfig;

    public ParklyClient(RestTemplate restTemplate, ParklyConfig parklyConfig) {
        this.restTemplate = restTemplate;
        this.parklyConfig = parklyConfig;
        this.restTemplate.setRequestFactory(new HttpComponentsClientHttpRequestFactory());
    }

    public ResponseEntity<?> getAllParkings(
            double latitude, double longitude, Double radius,
            LocalDateTime startDate, LocalDateTime endDate,
            Boolean isEv, Boolean isDisabled, Boolean isBig,
            String name, String city, Boolean sortByPrice, Boolean sortByDistance
    ) {
        String url = UriComponentsBuilder
                .fromHttpUrl(parklyConfig.getBaseUrl())
                .path("/api/parkings")
                .queryParam("latitude", latitude)
                .queryParam("longitude", longitude)
                .queryParamIfPresent("radius", java.util.Optional.ofNullable(radius))
                .queryParam("startDate", startDate)
                .queryParam("endDate", endDate)
                .queryParamIfPresent("isEv", java.util.Optional.ofNullable(isEv))
                .queryParamIfPresent("isDisabled", java.util.Optional.ofNullable(isDisabled))
                .queryParamIfPresent("isBig", java.util.Optional.ofNullable(isBig))
                .queryParamIfPresent("name", java.util.Optional.ofNullable(name))
                .queryParamIfPresent("city", java.util.Optional.ofNullable(city))
                .queryParamIfPresent("sortByPrice", java.util.Optional.ofNullable(sortByPrice))
                .queryParamIfPresent("sortByDistance", java.util.Optional.ofNullable(sortByDistance))
                .build().toUriString();

        try {
            var resp = restTemplate.getForEntity(url, ParkingResponse[].class);
            var list = resp.getBody() == null ? List.<ParkingResponse>of() : List.of(resp.getBody());
            return ResponseEntity.status(resp.getStatusCode()).body(list);
        } catch (HttpStatusCodeException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ex.getResponseBodyAsString());
        }
    }

    public ResponseEntity<?> getParkingDetails(String parkingId, LocalDateTime startDate, LocalDateTime endDate) {
        String url = UriComponentsBuilder
                .fromHttpUrl(parklyConfig.getBaseUrl())
                .path("/api/parkings/{id}")
                .queryParam("startDate", startDate)
                .queryParam("endDate", endDate)
                .buildAndExpand(parkingId)
                .toUriString();

        try {
            return restTemplate.getForEntity(url, ParkingDetailsResponse.class);
        } catch (HttpStatusCodeException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ex.getResponseBodyAsString());
        }
    }

    public ResponseEntity<?> getMyBookings(String email, LocalDate from, LocalDate to) {
        String url = UriComponentsBuilder
                .fromHttpUrl(parklyConfig.getBaseUrl())
                .path("/api/bookings")
                .queryParamIfPresent("from", java.util.Optional.ofNullable(from))
                .queryParamIfPresent("to", java.util.Optional.ofNullable(to))
                .build().toUriString();

        HttpHeaders headers = new HttpHeaders();
        headers.add("x-user-email", email);

        try {
            var req = RequestEntity.get(url).headers(headers).build();
            var resp = restTemplate.exchange(req, BookingResponse[].class);
            var list = resp.getBody() == null ? List.<BookingResponse>of() : List.of(resp.getBody());
            return ResponseEntity.status(resp.getStatusCode()).body(list);
        } catch (HttpStatusCodeException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ex.getResponseBodyAsString());
        }
    }

    public ResponseEntity<?> createBooking(String email, CreateBookingRequest body) {
        String url = UriComponentsBuilder
                .fromHttpUrl(parklyConfig.getBaseUrl())
                .path("/api/bookings")
                .build().toUriString();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        body.setSource("OFFICELY");
        body.setEmail(email);

        try {
            var req = new HttpEntity<>(body, headers);
            return restTemplate.postForEntity(url, req, CreateBookingResponse.class);
        } catch (HttpStatusCodeException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ex.getResponseBodyAsString());
        }
    }

    public ResponseEntity<?> getBookingById(String email, String bookingId) {
        String url = UriComponentsBuilder
                .fromHttpUrl(parklyConfig.getBaseUrl())
                .path("/api/bookings/{id}")
                .queryParam("email", email)
                .buildAndExpand(bookingId)
                .toUriString();

        try {
            var req = RequestEntity.get(url).build();
            return restTemplate.exchange(req, BookingResponse.class);
        } catch (HttpStatusCodeException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ex.getResponseBodyAsString());
        }
    }

    public ResponseEntity<?> cancelBooking(String email, String bookingId) {
        String url = UriComponentsBuilder
                .fromHttpUrl(parklyConfig.getBaseUrl())
                .path("/api/bookings/{id}")
                .buildAndExpand(bookingId)
                .toUriString();

        HttpHeaders headers = new HttpHeaders();
        headers.add("x-user-email", email);

        try {
            var req = RequestEntity.delete(url).headers(headers).build();
            return restTemplate.exchange(req, Void.class);
        } catch (HttpStatusCodeException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ex.getResponseBodyAsString());
        }
    }

    public ResponseEntity<?> editBooking(String email, String bookingId, EditBookingRequest body) {
        String url = UriComponentsBuilder
                .fromHttpUrl(parklyConfig.getBaseUrl())
                .path("/api/bookings/{id}")
                .buildAndExpand(bookingId)
                .toUriString();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        body.setEmail(email);

        try {
            var req = RequestEntity.patch(url).headers(headers).body(body);
            return restTemplate.exchange(req, BookingResponse.class);
        } catch (HttpStatusCodeException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ex.getResponseBodyAsString());
        }
    }
}