package com.officely.backend.service;

import com.officely.backend.api.Office;
import com.officely.backend.api.OfficeMapper;
import com.officely.backend.entity.OfficeEntity;
import com.officely.backend.entity.WorkspaceType;
import com.officely.backend.repository.OfficeRepository;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class OfficeService {
    private final OfficeRepository officeRepository;
    private final Geocoding geocoding;

    public OfficeService(OfficeRepository officeRepository, Geocoding geocoding){
        this.officeRepository = officeRepository;
        this.geocoding = geocoding;
    }

    public List<Office> listOffices(
            String nearAddress,
            Integer maxDistanceFromAddress,
            List<String> filter,
            String sort,
            Integer pageSize,
            String pageToken
    ) {
        if(pageSize == null || pageSize<=0) { pageSize = 10;}

        int pageIndex = 0;
        if(pageToken != null && !pageToken.isBlank()){
            try{
                pageIndex = Integer.parseInt(pageToken);
                if(pageIndex < 0) { pageIndex = 0; }
            }catch(Exception e){
                pageIndex = 0;
            }
        }

        Map<String, String> filterMap = parseFilter(filter);
        Specification<OfficeEntity> spec = buildSpecification(filterMap);

        Sort dbSort = buildDbSort(sort);
        if (dbSort.isUnsorted()) {
            dbSort = Sort.by(Sort.Direction.ASC, "id");
        }

        Pageable pageable = PageRequest.of(pageIndex, pageSize, dbSort);
        Page<OfficeEntity> page = officeRepository.findAll(spec, pageable);

        List<Office> dtos = page.getContent().stream()
                .map(OfficeMapper::toDto)
                .toList();

        if(nearAddress != null && !nearAddress.isBlank()) {
            computeDistance(dtos, nearAddress);
        }

        if(nearAddress != null && !nearAddress.isBlank() && maxDistanceFromAddress != null){
            dtos = applyDistanceFilter(dtos, maxDistanceFromAddress);
        }
        return sortDistance(dtos, sort);
    }

    private Map<String, String> parseFilter(List<String> filter){
        Map<String, String> result = new HashMap<>();
        if(filter == null) {return result;}

        for(String f: filter){
            if(f == null || f.isBlank()) {continue;}

            String[] parts = f.split(":", 2);
            if(parts.length == 2){
                result.put(parts[0],parts[1]);
            }
        }
        return result;
    }

    private Specification<OfficeEntity> buildSpecification(Map<String, String> filterMap){
        Integer minPrice = parseInt(filterMap.get("price.min"));
        Integer maxPrice = parseInt(filterMap.get("price.max"));

        WorkspaceType type = parseWorkspaceType(filterMap.get("workspace.type"));

        Boolean wifi = parseBool(filterMap.get("amenity.wifi"));
        Boolean access24 = parseBool(filterMap.get("amenity.24h"));
        Boolean kitchen = parseBool(filterMap.get("amenity.kitchen"));
        Boolean parking = parseBool(filterMap.get("amenity.parking"));
        Boolean wheelchair = parseBool(filterMap.get("amenity.wheelchair"));

        Boolean quiet = parseBool(filterMap.get("env.quiet"));
        Boolean social = parseBool(filterMap.get("env.social"));

        Boolean monitor = parseBool(filterMap.get("equipment.monitor"));
        Boolean printing = parseBool(filterMap.get("equipment.printing"));

        Specification<OfficeEntity> spec = Specification.allOf();

        if (minPrice != null) spec = spec.and((r, q, cb) -> cb.greaterThanOrEqualTo(r.get("maxPrice"), minPrice));
        if (maxPrice != null) spec = spec.and((r, q, cb) -> cb.lessThanOrEqualTo(r.get("minPrice"), maxPrice));

        if (type != null) spec = spec.and((r, q, cb) -> cb.equal(r.get("workspaceType"), type));

        if (Boolean.TRUE.equals(wifi)) spec = spec.and((r, q, cb) -> cb.isTrue(r.get("wifi")));
        if (Boolean.TRUE.equals(access24)) spec = spec.and((r, q, cb) -> cb.isTrue(r.get("access24h")));
        if (Boolean.TRUE.equals(kitchen)) spec = spec.and((r, q, cb) -> cb.isTrue(r.get("kitchen")));
        if (Boolean.TRUE.equals(parking)) spec = spec.and((r, q, cb) -> cb.isTrue(r.get("parking")));
        if (Boolean.TRUE.equals(wheelchair)) spec = spec.and((r, q, cb) -> cb.isTrue(r.get("wheelchairAccessible")));

        if (Boolean.TRUE.equals(quiet)) spec = spec.and((r, q, cb) -> cb.isTrue(r.get("quiet")));
        if (Boolean.TRUE.equals(social)) spec = spec.and((r, q, cb) -> cb.isTrue(r.get("social")));

        if (Boolean.TRUE.equals(monitor)) spec = spec.and((r, q, cb) -> cb.isTrue(r.get("monitor")));
        if (Boolean.TRUE.equals(printing)) spec = spec.and((r, q, cb) -> cb.isTrue(r.get("printer")));

        return spec;
    }

    private double haversine(double lat1, double lng1, double lat2, double lng2){
        final int R = 6371000;

        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lng2 - lng1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1))
                * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    private void computeDistance(List<Office> offices, String nearAddress){
        Geocoding.GeoPoint origin = geocoding.geocode(nearAddress);
        if(origin == null) {
            System.out.println(String.format("No geocoding result for address '%s', skipping distance filter", nearAddress));
            return;
        }

        double originLat = origin.getLat();
        double originLng = origin.getLng();
        for(Office o: offices){
            if (o.getLatitude() == null || o.getLongitude() == null) continue;
            double distance = haversine(originLat, originLng, o.getLatitude(), o.getLongitude());
            o.setDistanceMeters(distance);
        }
    }

    private List<Office> applyDistanceFilter(List<Office> offices, Integer maxDistanceFromAddress){
        return offices.stream()
                .filter(o -> o.getDistanceMeters() != null && o.getDistanceMeters() <= maxDistanceFromAddress)
                .toList();
    }

    private Sort buildDbSort(String sort){
        if(sort == null || sort.isBlank()) {return Sort.unsorted();}

        switch(sort.toLowerCase()){
            case "price_low_high":
                return Sort.by(Sort.Direction.ASC, "minPrice");
            case "price_high_low":
                return Sort.by(Sort.Direction.DESC, "minPrice");
            default: return Sort.unsorted();
        }
    }

    private List<Office> sortDistance(List<Office> offices, String sort){
        if(sort == null || sort.isBlank()) { return offices; }

        if(sort.equalsIgnoreCase("distance")){
            offices = offices.stream().sorted(Comparator.comparing(
                            Office::getDistanceMeters,
                            Comparator.nullsLast(Double::compareTo)
                    )).toList();
        }
        return offices;
    }

    private Integer parseInt(String filterValue){
        if(filterValue == null || filterValue.isBlank()) {return null;}
        try{
            return Integer.valueOf(filterValue);
        } catch(NumberFormatException e){
            return null;
        }
    }

    private Boolean parseBool(String filterValue){
        return filterValue != null && filterValue.equalsIgnoreCase("true");
    }

    private WorkspaceType parseWorkspaceType(String value){
        if(value == null) {return null;}

        switch(value.toLowerCase()){
            case "desk":
                return WorkspaceType.DESK;
            case "private-office":
                return WorkspaceType.PRIVATE_OFFICE;
            default:
                return null;
        }
    }
}
