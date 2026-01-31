package com.officely.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.officely.backend.entity.OfficeEntity;
import com.officely.backend.entity.OfficeOfferEntity;
import com.officely.backend.entity.OfficePhotoEntity;
import com.officely.backend.repository.OfficeOfferRepository;
import com.officely.backend.repository.OfficePhotoRepository;
import com.officely.backend.repository.OfficeRepository;
import com.officely.backend.storage.StorageService;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;


@Service
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class OfficeService {
    private final OfficeRepository officeRepository;
    private final Geocoding geocoding;
    private final OfficeOfferRepository officeOfferRepository;
    private final OfficePhotoRepository officePhotoRepository;
    private final StorageService storageService;
    @SuppressWarnings("FieldCanBeLocal")
    private final int DEFAULT_RADIUS_METERS = 50000;
    private final ObjectMapper objectMapper;

    @Getter
    @AllArgsConstructor
    public static class OfficeWithDistance {
        private final OfficeEntity office;
        private final double distanceMeters;
        private final int minPrice;
    }

    @Getter
    @AllArgsConstructor
    public static class OfficeWithDistanceOptPrice {
        private final OfficeEntity office;
        private final double distanceMeters;
        private final OptionalInt minPrice;
    }

    @Getter
    @AllArgsConstructor
    public static class OfficeSearchPage {
        private final List<OfficeWithDistance> offices;
        private final int currentPage;
        private final int lastPage;
        private final int pageSize;
        private final int minPrice;
        private final int maxPrice;
    }
    public OfficeSearchPage searchOffices(
            LocalDate startDate,
            LocalDate endDate,
            Double nearLat,
            Double nearLon,
            String nearAddress,
            Integer maxDistanceFromAddress,
            Integer minPrice,
            Integer maxPrice,
            List<String> filter,
            String sort,
            int pageSize,
            Integer pageToken
    ) {
        boolean hasCoords = nearLat != null && nearLon !=null;
        boolean hasAddress = nearAddress != null && !nearAddress.isBlank();

        if((nearLat == null) != (nearLon == null)){
            throw new IllegalArgumentException("nearLat and nearLon must be provided together");
        }

        if (startDate == null || endDate == null || endDate.isBefore(startDate) || startDate.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Invalid booking period"); 
        }

        if (pageSize <= 0 || pageSize > 50){ pageSize = 50; }
        Integer pageIndex = checkPageIndex(pageToken);

        if (!hasCoords && !hasAddress) {
            throw new IllegalArgumentException("Provide nearLat/nearLon or nearAddress when using distance");
        }
        if (maxDistanceFromAddress == null) {
            maxDistanceFromAddress = DEFAULT_RADIUS_METERS;
        }

        return listOfficesDistanceMode(startDate, endDate, nearLat, nearLon,nearAddress, maxDistanceFromAddress, minPrice, maxPrice, filter, sort, pageSize, pageIndex);
    }

    private OfficeSearchPage listOfficesDistanceMode(
            LocalDate startDate,
            LocalDate endDate,
            Double nearLat,
            Double nearLon,
            String nearAddress,
            int maxDistanceFromAddress,
            Integer minPrice,
            Integer maxPrice,
            List<String> filter,
            String sort,
            Integer pageSize,
            Integer pageIndex
    ) {
        int days = Math.toIntExact(ChronoUnit.DAYS.between(startDate, endDate) + 1);
        if (days < 1) {
            throw new IllegalArgumentException("The booking period must last at least 1 day");
        }

        Specification<OfficeEntity> spec = Specification.allOf();

        double originLat;
        double originLon;
        if (nearLat != null && nearLon != null) {
            originLat = nearLat;
            originLon = nearLon;
        }else {
            if (nearAddress == null || nearAddress.isBlank()) {
                throw new IllegalArgumentException("Provide nearLat/nearLon or nearAddress when using distance");
            }
            Geocoding.GeoPoint origin = geocoding.geocode(nearAddress);
            if (origin == null) {
                throw new IllegalArgumentException("Unable to geocode nearAddress");
            }
            originLat = origin.getLat();
            originLon = origin.getLng();
        }
        spec = spec.and(withinBoundingBox(originLat, originLon, maxDistanceFromAddress));

        List<OfficeEntity> entities = officeRepository.findAll(spec, Sort.by(Sort.Direction.ASC, "id"));

        Map<Long, Double> distances = computeDistances(entities, originLat, originLon);

        List<OfficeWithDistance> owd = entities.stream()
            .map(o -> new OfficeWithDistanceOptPrice(
                o,
                distances.getOrDefault(o.getId(), Double.POSITIVE_INFINITY),
                getOfficeOffers(o.getId(), startDate, endDate, minPrice, maxPrice, filter).stream().mapToInt(e -> e.totalPrice).min()
            ))
                .filter(e -> e.minPrice.isPresent())
                .map(o -> new OfficeWithDistance(
                        o.office,
                        o.distanceMeters,
                        o.minPrice.getAsInt()
                ))
            .toList();

        owd = applyDistanceFilter(owd, maxDistanceFromAddress);

        if (sort == null || sort.equalsIgnoreCase("distance")) {
            owd = owd.stream()
                    .sorted(Comparator
                    .comparing(OfficeWithDistance::getDistanceMeters)
                    .thenComparing(o -> o.getOffice().getId()))
                    .toList();
        }
        else if("priceasc".equalsIgnoreCase(sort) || "pricedesc".equalsIgnoreCase(sort)){
            Comparator<Integer> priceCmp;

            if ("pricedesc".equalsIgnoreCase(sort)) {
                priceCmp = Comparator.nullsLast(Comparator.reverseOrder());
            } else {
                priceCmp = Comparator.nullsLast(Comparator.naturalOrder());
            }

            owd = owd.stream().sorted(Comparator
                    .comparing(OfficeWithDistance::getMinPrice, priceCmp)
                    .thenComparing(OfficeWithDistance::getDistanceMeters)
                    .thenComparing(o -> o.getOffice().getId()))
                    .toList();
        }

        int totalResults = owd.size();
        int lastPage = (totalResults == 0) ? 0 : (totalResults - 1) / pageSize;

        if(pageIndex < 0 ) { pageIndex = 0; }
        if(pageIndex > lastPage) { pageIndex = lastPage; }

        int from = pageIndex * pageSize;
        int to = Math.min(from + pageSize, totalResults);

        List<OfficeWithDistance> resultsForPage =  (from >= totalResults) ? List.of() : owd.subList(from, to);

        int min = owd.stream().mapToInt(OfficeWithDistance::getMinPrice).min().orElse(0);
        int max = owd.stream().mapToInt(OfficeWithDistance::getMinPrice).max().orElse(0);

        return new OfficeSearchPage(resultsForPage, pageIndex, lastPage, pageSize, min, max);
    }

    public Optional<OfficeEntity> getOfficeById(long id) {
        return officeRepository.findById(id);
    }

    @Getter
    @AllArgsConstructor
    public static class OfficeOffer {
        private OfficeOfferEntity entity;
        private int totalPrice;
    }
    public List<OfficeOffer> getOfficeOffers(long officeId, LocalDate startDate, LocalDate endDate, Integer minPrice, Integer maxPrice, List<String> filter){
        if (startDate == null || endDate == null || endDate.isBefore(startDate) || startDate.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Invalid booking period");
        }

        int days = Math.toIntExact(ChronoUnit.DAYS.between(startDate, endDate) + 1);
        if (days < 1) {
            throw new IllegalArgumentException("The booking period must last at least 1 day");
        }

        Map<String, String> filterMap = parseFilter(filter);
        int minPricePerDay = minPrice != null ? minPrice / days : 0;
        int maxPricePerDay = maxPrice != null ? maxPrice / days : Integer.MAX_VALUE;
        try {
            var filterStr = objectMapper.writeValueAsString(filterMap);

            return officeOfferRepository.findAvailableOffers(officeId, startDate, endDate, minPricePerDay, maxPricePerDay, filterStr)
                    .stream()
                    .map(e -> new OfficeOffer(e, days * e.getPricePerDay()))
                    .toList();
        } catch (JsonProcessingException ex) {
            throw new IllegalArgumentException("Filters can't be written as an object"); // Shouldn't happen?
        }
    }

    private Integer checkPageIndex(Integer pageToken){
        if(pageToken == null || pageToken < 0)
            return 0;
        return pageToken;
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

    private Specification<OfficeEntity> withinBoundingBox(double lat, double lon, int radiusMeters) {
        double metersPerDeg = 111_320.0;

        double latRad = Math.toRadians(lat);

        double dLat = radiusMeters / metersPerDeg;
        double dLon = radiusMeters / (metersPerDeg * Math.cos(latRad));

        double minLat = lat - dLat;
        double maxLat = lat + dLat;
        double minLon = lon - dLon;
        double maxLon = lon + dLon;

        return (root, _, cb) -> cb.and(
                cb.between(root.get("latitude"), minLat, maxLat),
                cb.between(root.get("longitude"), minLon, maxLon)
        );
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

    private Map<Long, Double> computeDistances(List<OfficeEntity> offices, double originLat, double originLon){
        Map<Long, Double> result = new HashMap<>();
        for(var o: offices){
            double distance = haversine(originLat, originLon, o.getLatitude(), o.getLongitude());
            result.put(o.getId(), distance);
        }
        return result;
    }

    private List<OfficeWithDistance> applyDistanceFilter(List<OfficeWithDistance> offices, Integer maxDistanceFromAddress){
        return offices.stream()
                .filter(o -> o.getDistanceMeters() <= maxDistanceFromAddress)
                .toList();
    }

    public Page<OfficeEntity> getOffices(PageRequest pageRequest) {
        return officeRepository.findAll(pageRequest);
    }
    public Page<OfficeEntity> getOffices(PageRequest pageRequest, String search) {
        try {
            var id = Long.parseLong(search);
            return officeRepository.getByIdOrNameContainingIgnoreCaseOrAddressContainingIgnoreCase(id, search, search, pageRequest);
        } catch (Exception ex) {
            return officeRepository.getByNameContainingIgnoreCaseOrAddressContainingIgnoreCase(search, search, pageRequest);
        }
    }

    public OfficeEntity createOffice(OfficeEntity entity){
        var office = officeRepository.save(entity);
        office.setPhotos(officePhotoRepository.saveAll(entity.getPhotos()));
        return office;
    }
    public OfficeEntity patchOffice(OfficeEntity updated) {
        Geocoding.GeoPoint origin = geocoding.geocode(updated.getAddress());
        if (origin == null) {
            throw new IllegalArgumentException("Unable to geocode nearAddress");
        }
        updated.setLatitude(origin.getLat());
        updated.setLongitude(origin.getLng());
        return officeRepository.save(updated);
    }
    @SuppressWarnings("UnusedReturnValue")
    @Transactional
    public OfficeEntity patchOffice(OfficeEntity updated, List<String> photos, List<MultipartFile> addedPhotos) {
        var currentPhotos = updated.getPhotos();
        var finalPhotos = new ArrayList<OfficePhotoEntity>();
        for(var photo: photos) {
            if(photo.matches("^current\\[[0-9]+]$")) {
                var indexStr = photo.substring("current[".length(), photo.length()-1);
                var index = Integer.parseInt(indexStr);
                if(index >= currentPhotos.size())
                    throw new RuntimeException("Invalid index of photo");
                var current = currentPhotos.get(index);

                var entity = new OfficePhotoEntity();
                entity.setFilename(current.getFilename());
                entity.setOffice(updated);
                officePhotoRepository.save(entity);
                finalPhotos.add(entity);
            } else if(photo.matches("^added\\[[0-9]+]$")) {
                var indexStr = photo.substring("added[".length(), photo.length()-1);
                var index = Integer.parseInt(indexStr);
                if(index >= addedPhotos.size())
                    throw new RuntimeException("Invalid index of photo");
                var current = addedPhotos.get(index);
                var filename = storageService.store(current);
                var entity = new OfficePhotoEntity();
                entity.setFilename(filename);
                entity.setOffice(updated);
                officePhotoRepository.save(entity);
                finalPhotos.add(entity);
            }
        }
        updated.setPhotos(finalPhotos);
        return patchOffice(updated);
    }
}
