package com.officely.backend.service;

import com.officely.backend.entity.*;
import com.officely.backend.modules.flatly.api.offices.dto.*;
import com.officely.backend.modules.flatly.api.offices.mapper.OfficeMapper;
import com.officely.backend.modules.flatly.api.offices.mapper.OfficeOfferMapper;
import com.officely.backend.repository.OfficeOfferRepository;
import com.officely.backend.repository.OfficePhotoRepository;
import com.officely.backend.repository.OfficeRepository;
import com.officely.backend.storage.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
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

    private static class OfficeWithDistance {
        private final OfficeDto office;
        private final Double distanceMeters;
        private final Integer minPrice;

        private OfficeWithDistance(OfficeDto office, Double distanceMeters, Integer minPrice) {
            this.office = office;
            this.distanceMeters = distanceMeters;
            this.minPrice = minPrice;
        }

        public OfficeDto getOffice() { return office; }
        public Double getDistanceMeters() { return distanceMeters; }
        public Integer getMinPrice() { return minPrice; }
    }

    private static class OfficeSearchPage {
        private final List<OfficeWithDistance> offices;
        private final int currentPage;
        private final int lastPage;
        private final int pageSize;

        private OfficeSearchPage(List<OfficeWithDistance> offices, int currentPage, int lastPage, int pageSize) {
            this.offices = offices;
            this.currentPage = currentPage;
            this.lastPage = lastPage;
            this.pageSize = pageSize;
        }

        public List<OfficeWithDistance> getOffices() { return offices; }
        public int getCurrentPage() { return currentPage; }
        public int getLastPage() { return lastPage; }
        public int getPageSize() { return pageSize; }
    }

    public OfficeSearchResponseDto searchOffices(
            LocalDate startDate,
            LocalDate endDate,
            String nearAddress,
            Integer maxDistanceFromAddress,
            List<String> filter,
            String sort,
            Integer pageSize,
            String pageToken
    ) {
        if (startDate == null || endDate == null || !endDate.isAfter(startDate) || startDate.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Invalid booking period"); 
        }

        if (pageSize == null || pageSize <= 0 || pageSize > 50){ pageSize = 50; }
        Integer pageIndex = checkPageIndex(pageToken);

        boolean distanceMode = (maxDistanceFromAddress != null) ||  (sort != null && sort.equalsIgnoreCase("distance"));

        OfficeSearchPage page;
        if(distanceMode){
            if (nearAddress == null || nearAddress.isBlank()) {
                throw new IllegalArgumentException("nearAddress is required when using distance");
            }
            page = listOfficesDistanceMode(startDate, endDate, nearAddress, maxDistanceFromAddress, filter, sort, pageSize, pageIndex);
        }else{
            page = listOfficesPriceMode(startDate, endDate, nearAddress, filter, sort, pageSize, pageIndex);
        }

        return toSearchResponse(page, startDate, endDate, nearAddress, maxDistanceFromAddress, filter, sort, pageSize, pageToken);
    }

    private OfficeSearchPage listOfficesDistanceMode(
            LocalDate startDate,
            LocalDate endDate,
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
        boolean hasPriceFilter = (minPrice != null || maxPrice != null);

        Map<String, String> filterMapNoPrice = new HashMap<>(filterMap);
        filterMapNoPrice.remove("price.min");
        filterMapNoPrice.remove("price.max");

        Specification<OfficeEntity> spec = buildOfficeSpecification(filterMapNoPrice);

        List<OfficeEntity> entities = officeRepository.findAll(spec, Sort.by(Sort.Direction.ASC, "id"));
        List<OfficeDto> dtos = entities.stream().map(OfficeMapper::toDto).toList();

        Map<String, Double> distances = computeDistances(dtos, nearAddress);

        Map<String, Integer> prices = fetchMinTotalPrices(days, minPrice, maxPrice);

        List<OfficeWithDistance> owd = dtos.stream()
                .map(o -> new OfficeWithDistance(o, distances.get(o.getId()),
                 prices.get(o.getId())))
                .filter(o -> o.getDistanceMeters() != null) 
                .toList();

        if (maxDistanceFromAddress != null) {
            owd = applyDistanceFilter(owd, maxDistanceFromAddress);
        }

        if (hasPriceFilter) {
            owd = owd.stream()
                    .filter(o -> o.getMinPrice() != null)
                    .toList();
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
       
        return new OfficeSearchPage(resultsForPage, pageIndex, lastPage, pageSize);
    }

    private OfficeSearchPage listOfficesPriceMode(
            LocalDate startDate,
            LocalDate endDate,
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
        List<OfficeDto> allowedDtos = allowedOffices.stream().map(OfficeMapper::toDto).toList();
        Map<String, Integer> prices = fetchMinTotalPrices(days, minPrice, maxPrice);

        List<OfficeDto> dtos = allowedDtos.stream().filter(o -> prices.containsKey(o.getId())).toList();

        Map<String, Double> distances = computeDistances(dtos, nearAddress);
        List<OfficeWithDistance> owd = dtos.stream().map(o -> new OfficeWithDistance(o,
                distances.get(o.getId()),
                prices.get(o.getId())))
                .toList();

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
        return new OfficeSearchPage(resultsForPage, pageIndex, lastPage, pageSize);
    }

    private OfficeSearchResponseDto toSearchResponse(OfficeSearchPage offices, LocalDate startDate,
        LocalDate endDate, String nearAddress, Integer maxDistanceFromAddress, List<String>filter,
        String sort, Integer pageSize, String pageToken){

        OfficeSearchResponseDto response = new OfficeSearchResponseDto();
        List<OfficeSearchResultDto> results = new ArrayList<>();

        for(OfficeWithDistance owd: offices.getOffices()){
            OfficeDto office = owd.getOffice();
            OfficeSearchResultDto res = new OfficeSearchResultDto();
            res.setOffice(office);

            OfficeSearchQueryDetailsDto q = new OfficeSearchQueryDetailsDto();
            if(owd.getDistanceMeters() != null){
                q.setDistance((int)Math.round(owd.getDistanceMeters()));
            }else{
                q.setDistance(null);
            }

            q.setMinPrice(owd.getMinPrice());
            res.setQuery(q);

            String offersLink = "/offices/" + office.getId() + "/offers?startDate=" + startDate + "&endDate=" + endDate;
            if (filter != null) {
                for (String f : filter) {
                    offersLink += "&filter=" + java.net.URLEncoder.encode(f, java.nio.charset.StandardCharsets.UTF_8);
                }
            }

            OfficeSearchResultDto.Links links = new OfficeSearchResultDto.Links();
            links.setOffers(offersLink);

            res.setLinks(links);
            results.add(res);
        }

        response.setResults(results);

        Map<String, String> filterMap = parseFilter(filter);
        Integer minPrice = parseInt(filterMap.get("price.min"));
        Integer maxPrice = parseInt(filterMap.get("price.max"));

        OfficeSearchResponseDto.Query query = new OfficeSearchResponseDto.Query();
        query.setMinPrice(minPrice);
        query.setMaxPrice(maxPrice);
        response.setQuery(query);

        OfficeSearchResponseDto.Pagination pagination = new OfficeSearchResponseDto.Pagination();
        pagination.setCurrentPage(offices.getCurrentPage());
        pagination.setLastPage(offices.getLastPage());
        pagination.setPageSize(offices.getPageSize());
        response.setPagination(pagination);

        String base = "/offices" + "?startDate=" + startDate + "&endDate=" + endDate;

        if (nearAddress != null) {
            base += "&nearAddress=" + java.net.URLEncoder.encode(nearAddress, java.nio.charset.StandardCharsets.UTF_8);
        }
        if (maxDistanceFromAddress != null) {
            base += "&maxDistanceFromAddress=" + maxDistanceFromAddress;
        }
        if (sort != null) {
            base += "&sort=" + java.net.URLEncoder.encode(sort, java.nio.charset.StandardCharsets.UTF_8);
        }
        if (pageSize != null) {
            base += "&pageSize=" + pageSize;
        }
        if (filter != null) {
            for (String f : filter) {
                base += "&filter=" + java.net.URLEncoder.encode(f, java.nio.charset.StandardCharsets.UTF_8);
            }
        }

        int lastPage = offices.getLastPage();
        int currentPage = offices.getCurrentPage();

        OfficeSearchResponseDto.Links links = new OfficeSearchResponseDto.Links();
        links.setSelf(base + "&pageToken=" + currentPage);
        links.setFirst(base + "&pageToken=0");
        links.setLast(base + "&pageToken=" + lastPage);

        if (currentPage < lastPage) {
            links.setNext(base + "&pageToken=" + (currentPage + 1));
        }
        if (currentPage > 0) {
            links.setPrev(base + "&pageToken=" + (currentPage - 1));
        }
        response.setLinks(links);

        return response;
    }

    private Map<String, Integer> fetchMinTotalPrices(long days, Integer minPrice, Integer maxPrice) {
        Map<String, Integer> result = new HashMap<>();

        int page = 0;
        int batchSize = 500;

        while (true) {
            Page<OfficeOfferRepository.OfficeMinPrice> p = officeOfferRepository.findOfficeMinPricesAsc(days, minPrice, maxPrice, PageRequest.of(page, batchSize));

            for (OfficeOfferRepository.OfficeMinPrice row : p.getContent()) {
                result.put(String.valueOf(row.getOfficeId()), row.getMinPrice().intValue());
            }

            if (!p.hasNext()) break;
            page++;
        }
        return result;
    }

    public OfficeDto getOfficeById(String officeId) {
        Long id;
        try {
            id = Long.parseLong(officeId);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid officeId");
        }

        OfficeEntity entity = officeRepository.findById(id).orElseThrow(() -> new NoSuchElementException("Office not found"));
        OfficeDto dto = OfficeMapper.toDto(entity);

        return dto;
    }
    public Optional<OfficeEntity> getOfficeById(long id) {
        return officeRepository.findById(id);
    }

    public OfficeOffersResponseDto getOfficeOffers(String officeId, LocalDate startDate, LocalDate endDate, List<String> filter){
        if (startDate == null || endDate == null || !endDate.isAfter(startDate) || startDate.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Invalid booking period");
        }

        long days = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate);
        if (days < 1) {
            throw new IllegalArgumentException("The booking period must last at least 1 day");
        }

        Long id;
        try {
            id = Long.parseLong(officeId);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid officeId");
        }

        Map<String, String> filterMap = parseFilter(filter);
        Integer minPrice = parseInt(filterMap.get("price.min"));
        Integer maxPrice = parseInt(filterMap.get("price.max"));

        Specification<OfficeOfferEntity> spec = buildOfferSpec(id, filter);
        List<OfficeOfferEntity> entities = officeOfferRepository.findAll(spec);

        List<OfficeOfferDto> offers = new ArrayList<>();
        for (OfficeOfferEntity entity : entities) {
            int totalPrice = Math.toIntExact(days * (long) entity.getPricePerDay());

            if (minPrice != null && totalPrice < minPrice) continue;
            if (maxPrice != null && totalPrice > maxPrice) continue;

            OfficeOfferDto dto = OfficeOfferMapper.toDto(entity, days, id);

            offers.add(dto);
        }
        OfficeOffersResponseDto response = new OfficeOffersResponseDto();
        response.setOffers(offers);

        String self = "/offices/" + officeId + "/offers?startDate=" + startDate + "&endDate=" + endDate;
        if (filter != null) {
            for (String f : filter) {
                self += "&filter=" + java.net.URLEncoder.encode(f, java.nio.charset.StandardCharsets.UTF_8);
            }
        }
        OfficeOffersResponseDto.Links links = new OfficeOffersResponseDto.Links();
        links.setSelf(self);

        response.setLinks(links);

        return response;
    }

    private Integer checkPageIndex(String pageToken){
        int pageIndex = 0;
        if(pageToken != null && !pageToken.isBlank()){
            try{
                pageIndex = Integer.parseInt(pageToken);
                if(pageIndex < 0) { pageIndex = 0; }
            }catch(Exception e){
                pageIndex = 0;
            }
        }
        return pageIndex;
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

    private Map<String, Double> computeDistances(List<OfficeDto> offices, String nearAddress){
        Map<String, Double> result = new HashMap<>();
        if (nearAddress == null || nearAddress.isBlank()) {
            throw new IllegalArgumentException("nearAddress is required when using distance");
        }

        Geocoding.GeoPoint origin = geocoding.geocode(nearAddress);
        if (origin == null) {
            throw new IllegalArgumentException("Unable to geocode nearAddress");
        }

        double originLat = origin.getLat();
        double originLon = origin.getLng();

        for(OfficeDto o: offices){
            CoordinatesDto c = o.getCoordinates();
            if (c == null || c.getLat() == null || c.getLon() == null) continue;

            double distance = haversine(originLat, originLon, c.getLat(), c.getLon());
            result.put(o.getId(), distance);
        }
        return result;
    }

    private List<OfficeWithDistance> applyDistanceFilter(List<OfficeWithDistance> offices, Integer maxDistanceFromAddress){
        return offices.stream()
                .filter(o -> o.getDistanceMeters() != null && o.getDistanceMeters() <= maxDistanceFromAddress)
                .toList();
    }

    private Sort buildDbSort(String sort){
        if(sort == null || sort.isBlank()) {return Sort.unsorted();}

        switch(sort.toLowerCase()){
            case "priceasc":
                return Sort.by(Sort.Direction.ASC, "minPrice");
            case "pricedesc":
                return Sort.by(Sort.Direction.DESC, "minPrice");
            default: return Sort.unsorted();
        }
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
