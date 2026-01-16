package com.officely.backend.flatly.api.offices.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class OfficeSearchResponseDto {
    private List<OfficeSearchResultDto> results;
    private Query query;

    @JsonProperty("_pagination")
    private Pagination pagination;

    @JsonProperty("_links")
    private Links links;

    public List<OfficeSearchResultDto> getResults() { return results; }
    public void setResults(List<OfficeSearchResultDto> results) { this.results = results; }

    public Query getQuery() { return query; }
    public void setQuery(Query query) { this.query = query; }

    public Pagination getPagination() { return pagination; }
    public void setPagination(Pagination pagination) { this.pagination = pagination; }

    public Links getLinks() { return links; }
    public void setLinks(Links links) { this.links = links; }

    public static class Query {
        private Integer minPrice;
        private Integer maxPrice;

        public Integer getMinPrice() { return minPrice; }
        public void setMinPrice(Integer minPrice) { this.minPrice = minPrice; }

        public Integer getMaxPrice() { return maxPrice; }
        public void setMaxPrice(Integer maxPrice) { this.maxPrice = maxPrice; }
    }

    public static class Pagination {
        private Integer currentPage;
        private Integer lastPage;
        private Integer pageSize;

        public Integer getCurrentPage() { return currentPage; }
        public void setCurrentPage(Integer currentPage) { this.currentPage = currentPage; }

        public Integer getLastPage() { return lastPage; }
        public void setLastPage(Integer lastPage) { this.lastPage = lastPage; }

        public Integer getPageSize() { return pageSize; }
        public void setPageSize(Integer pageSize) { this.pageSize = pageSize; }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Links {

        private String self;
        private String first;
        private String last;
        private String next;
        private String prev;

        public Links() {}

        public Links(String self, String first, String last, String next, String prev) {
            this.self = self;
            this.first = first;
            this.last = last;
            this.next = next;
            this.prev = prev;
        }

        public String getSelf() { return self; }
        public void setSelf(String self) { this.self = self; }

        public String getFirst() { return first; }
        public void setFirst(String first) { this.first = first; }

        public String getLast() { return last; }
        public void setLast(String last) { this.last = last; }

        public String getNext() { return next; }
        public void setNext(String next) { this.next = next; }

        public String getPrev() { return prev; }
        public void setPrev(String prev) { this.prev = prev; }
    }

}