package com.officely.backend.service;

import org.springframework.http.HttpHeaders;
import org.springframework.http.RequestEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Service
public class NominatimGeocordingService implements Geocoding {
    private final RestTemplate restTemplate;

    public NominatimGeocordingService(RestTemplate restTemplate){
        this.restTemplate = restTemplate;
    }

    @Override
    public GeoPoint geocode(String address){
        if(address == null || address.isBlank()) { return null; }

        try{
            String encoded = URLEncoder.encode(address, StandardCharsets.UTF_8);
            String url =  "https://nominatim.openstreetmap.org/search?q=" + encoded + "&format=json&limit=1";

            HttpHeaders headers = new HttpHeaders();
            headers.add("User-Agent", "officely-backend/1.0 (01189002@pw.edu.pl)");
            RequestEntity<Void> request = RequestEntity.get(URI.create(url)).headers(headers).build();

            var response = restTemplate.exchange(request, Map[].class);
            Map[] body = response.getBody();

            if(body == null || body.length == 0) { return null; }
            Map<String, Object> first = body[0];

            double lat = Double.parseDouble(first.get("lat").toString());
            double lon = Double.parseDouble(first.get("lon").toString());

            return new GeoPoint(lat, lon);
        }catch(Exception e){
            System.out.println(String.format("Failed to geocode address '%s'", address));
            e.printStackTrace();
            return null;
        }
    }
}
