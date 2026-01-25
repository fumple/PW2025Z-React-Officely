package com.officely.backend.service;

import com.officely.backend.entity.OfficeEntity;
import com.officely.backend.entity.OfficeOfferEntity;
import com.officely.backend.entity.OfficePhotoEntity;
import com.officely.backend.entity.WorkspaceType;
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
import java.util.*;


@Service
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class OfficeService {
    private final OfficeRepository officeRepository;
    private final Geocoding geocoding;
    private final OfficeOfferRepository officeOfferRepository;
    private final OfficePhotoRepository officePhotoRepository;
    private final StorageService storageService;
    private final int DEFAULT_RADIUS_METERS = 50000;

    @Getter
    @AllArgsConstructor
    public static class OfficeWithDistance {
        private final OfficeEntity office;
        private final double distanceMeters;
        private final int minPrice;
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

        if (startDate == null || endDate == null || !endDate.isAfter(startDate) || startDate.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Invalid booking period"); 
        }

        if (pageSize <= 0 || pageSize > 50){ pageSize = 50; }
        Integer pageIndex = checkPageIndex(pageToken);
        boolean distanceMode = hasCoords || (maxDistanceFromAddress != null) ||  (sort != null && sort.equalsIgnoreCase("distance"));

        if (distanceMode && !hasCoords && !hasAddress) {
            throw new IllegalArgumentException("Provide nearLat/nearLon or nearAddress when using distance");
        }
        if (distanceMode && maxDistanceFromAddress == null) {
            maxDistanceFromAddress = DEFAULT_RADIUS_METERS;
        }

        if(distanceMode){
            return listOfficesDistanceMode(startDate, endDate, nearLat, nearLon,nearAddress, maxDistanceFromAddress, filter, sort, pageSize, pageIndex);
        }
        return listOfficesPriceMode(startDate, endDate, nearLat, nearLon, nearAddress, filter, sort, pageSize, pageIndex);
    }

    private OfficeSearchPage listOfficesDistanceMode(
            LocalDate startDate,
            LocalDate endDate,
            Double nearLat,
            Double nearLon,
            String nearAddress,
            Integer maxDistanceFromAddress,
            List<String> filter,
            String sort,
            Integer pageSize,
            Integer pageIndex
    ) {
        long days = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate);
        if (days < 1) {
            throw new IllegalArgumentException("The booking period must last at least 1 day");
        }

        Map<String, String> filterMap = parseFilter(filter);

        Integer minPrice = parseInt(filterMap.get("price.min"));
        Integer maxPrice = parseInt(filterMap.get("price.max"));

        Map<String, String> filterMapNoPrice = new HashMap<>(filterMap);
        filterMapNoPrice.remove("price.min");
        filterMapNoPrice.remove("price.max");
        
        Specification<OfficeEntity> spec = buildOfficeSpecification(filterMapNoPrice);

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
        if (maxDistanceFromAddress != null) {
            spec = spec.and(withinBoundingBox(originLat, originLon, maxDistanceFromAddress));
        }

        List<OfficeEntity> entities = officeRepository.findAll(spec, Sort.by(Sort.Direction.ASC, "id"));

        Map<Long, Double> distances = computeDistances(entities, originLat, originLon);

        Map<Long, Integer> prices = fetchMinTotalPrices(days, minPrice, maxPrice);

        List<OfficeWithDistance> owd = entities.stream()
            .filter(o -> prices.containsKey(o.getId())) 
            .map(o -> new OfficeWithDistance(
                o,
                distances.getOrDefault(o.getId(), Double.POSITIVE_INFINITY),
                prices.get(o.getId())
            ))
            .toList();

        if (maxDistanceFromAddress != null) {
            owd = applyDistanceFilter(owd, maxDistanceFromAddress);
        }

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

    private OfficeSearchPage listOfficesPriceMode(
            LocalDate startDate,
            LocalDate endDate,
            Double nearLat, 
            Double nearLon,
            String nearAddress,
            List<String> filter,
            String sort,
            Integer pageSize,
            Integer pageIndex
    ) {
        long days = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate);
        if (days < 1) {
            throw new IllegalArgumentException("The booking period must last at least 1 day");
        }

        Map<String, String> filterMap = parseFilter(filter);

        Integer minPrice = parseInt(filterMap.get("price.min"));
        Integer maxPrice = parseInt(filterMap.get("price.max"));

        Map<String, String> filterMapNoPrice = new HashMap<>(filterMap);
        filterMapNoPrice.remove("price.min");
        filterMapNoPrice.remove("price.max");

        Specification<OfficeEntity> spec = buildOfficeSpecification(filterMapNoPrice);

        List<OfficeEntity> allowedOffices = officeRepository.findAll(spec, Sort.by(Sort.Direction.ASC, "id"));
        Map<Long, Integer> prices = fetchMinTotalPrices(days, minPrice, maxPrice);

        var offices = allowedOffices.stream().filter(o -> prices.containsKey(o.getId())).toList();

        Map<Long, Double> tmp = new HashMap<>();

        if (nearLat != null && nearLon != null) {
            tmp = computeDistances(offices, nearLat, nearLon);
        } else if (nearAddress != null && !nearAddress.isBlank()) {
            Geocoding.GeoPoint origin = geocoding.geocode(nearAddress);
            if (origin != null) {
                tmp = computeDistances(offices, origin.getLat(), origin.getLng());
            }
        }

        final Map<Long, Double> distances = tmp;
        List<OfficeWithDistance> owd = offices.stream().map(o -> new OfficeWithDistance(o,
            distances.getOrDefault(o.getId(), Double.POSITIVE_INFINITY),
            prices.get(o.getId()))).toList();

        Comparator<OfficeWithDistance> cmp = Comparator
                .comparing((OfficeWithDistance o) -> prices.get(o.getOffice().getId()))
                .thenComparing(OfficeWithDistance::getDistanceMeters, Comparator.nullsLast(Double::compareTo))
                .thenComparing(o -> o.getOffice().getId());

        if ("pricedesc".equalsIgnoreCase(sort)) {
            cmp = Comparator
                    .comparing((OfficeWithDistance o) -> prices.get(o.getOffice().getId()), Comparator.reverseOrder())
                    .thenComparing(OfficeWithDistance::getDistanceMeters, Comparator.nullsLast(Double::compareTo))
                    .thenComparing(o -> o.getOffice().getId());
        }
        owd = owd.stream().sorted(cmp).toList();

        int totalResults = owd.size();
        int lastPage = (totalResults == 0) ? 0 : (totalResults - 1) / pageSize;

        if (pageIndex > lastPage) pageIndex = lastPage;
        if (pageIndex < 0) pageIndex = 0;

        int from = pageIndex * pageSize;
        int to = Math.min(from + pageSize, totalResults);

        List<OfficeWithDistance> resultsForPage = (from >= totalResults) ? List.of() : owd.subList(from, to);

        int min = owd.stream().mapToInt(OfficeWithDistance::getMinPrice).min().orElse(0);
        int max = owd.stream().mapToInt(OfficeWithDistance::getMinPrice).max().orElse(0);

        return new OfficeSearchPage(resultsForPage, pageIndex, lastPage, pageSize, min, max);
    }

    private Map<Long, Integer> fetchMinTotalPrices(long days, Integer minPrice, Integer maxPrice) {
        Map<Long, Integer> result = new HashMap<>();

        int page = 0;
        int batchSize = 500;

        while (true) {
            Page<OfficeOfferRepository.OfficeMinPrice> p = officeOfferRepository.findOfficeMinPricesAsc(days, minPrice, maxPrice, PageRequest.of(page, batchSize));

            for (OfficeOfferRepository.OfficeMinPrice row : p.getContent()) {
                result.put(row.getOfficeId(), row.getMinPrice().intValue());
            }

            if (!p.hasNext()) break;
            page++;
        }
        return result;
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
    public List<OfficeOffer> getOfficeOffers(long officeId, LocalDate startDate, LocalDate endDate, List<String> filter){
        if (startDate == null || endDate == null || !endDate.isAfter(startDate) || startDate.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Invalid booking period");
        }

        long days = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate);
        if (days < 1) {
            throw new IllegalArgumentException("The booking period must last at least 1 day");
        }

        Map<String, String> filterMap = parseFilter(filter);
        Integer minPrice = parseInt(filterMap.get("price.min"));
        Integer maxPrice = parseInt(filterMap.get("price.max"));

        Specification<OfficeOfferEntity> spec = buildOfferSpec(officeId, filter);
        List<OfficeOfferEntity> entities = officeOfferRepository.findAll(spec);

        List<OfficeOffer> offers = new ArrayList<>();
        for (OfficeOfferEntity entity : entities) {
            int totalPrice = Math.toIntExact(days * (long) entity.getPricePerDay());

            if (minPrice != null && totalPrice < minPrice) continue;
            if (maxPrice != null && totalPrice > maxPrice) continue;

            offers.add(new OfficeOffer(entity, totalPrice));
        }
        return offers;
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

    private Specification<OfficeOfferEntity> buildOfferSpec(Long officeId, List<String> filter) {
        Map<String, String> filterMap = parseFilter(filter);

        Specification<OfficeOfferEntity> spec = (root, q, cb) ->
                cb.equal(root.get("office").get("id"), officeId);

        WorkspaceType type = parseWorkspaceType(filterMap.get("workspace.type"));
        if (type != null) {
            spec = spec.and((root, q, cb) -> cb.equal(root.get("office").get("workspaceType"), type));
        }

        for (String key : filterMap.keySet()) {
            String value = filterMap.get(key);

            if (isTrue(value) && isFeatureKey(key)) {
                spec = spec.and(offerHasFeature(key));
            }
        }

        return spec;
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

        return (root, q, cb) -> cb.and(
                cb.between(root.get("latitude"), minLat, maxLat),
                cb.between(root.get("longitude"), minLon, maxLon)
        );
    }

    private Specification<OfficeEntity> buildOfficeSpecification(Map<String, String> filterMap){
        WorkspaceType type = parseWorkspaceType(filterMap.get("workspace.type"));

        Specification<OfficeEntity> spec = Specification.allOf();

        if (type != null) spec = spec.and((r, q, cb) -> cb.equal(r.get("workspaceType"), type));

        for (String key : filterMap.keySet()) {
            String value = filterMap.get(key);

            if (isTrue(value) && isFeatureKey(key)) {
                spec = spec.and(officeHasFeature(key));
            }
        }
        return spec;
    }

    private boolean isTrue(String value) {
        return value != null && value.equalsIgnoreCase("true");
    }

    private boolean isFeatureKey(String key) {
        if (key == null) return false;

        return key.startsWith("amenity.") || key.startsWith("env.") || key.startsWith("equipment.");
    }

    private Specification<OfficeOfferEntity> offerHasFeature(String featureKey){
        return (r,q,cb)->cb.isMember(featureKey, r.get("office").get("features"));
    }

    private Specification<OfficeEntity> officeHasFeature(String featureKey){
        return (r,q,cb)->cb.isMember(featureKey, r.get("features"));
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

    private Integer parseInt(String filterValue){
        if(filterValue == null || filterValue.isBlank()) {return null;}
        try{
            return Integer.valueOf(filterValue);
        } catch(NumberFormatException e){
            return null;
        }
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
