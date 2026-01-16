package com.officely.backend.api.bookings.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class BookingsResponseDto {
    private List<BookingDto> bookings;

    @JsonProperty("_pagination")
    private Pagination pagination;

    @JsonProperty("_links")
    private Links links;

    public BookingsResponseDto() {}

    public BookingsResponseDto(List<BookingDto> bookings, Pagination pagination, Links links
    ) {
        this.bookings = bookings;
        this.pagination = pagination;
        this.links = links;
    }

    public List<BookingDto> getBookings() { return bookings; }
    public void setBookings(List<BookingDto> bookings) { this.bookings = bookings; }

    public Pagination getPagination() { return pagination; }
    public void setPagination(Pagination pagination) { this.pagination = pagination; }

    public Links getLinks() { return links; }
    public void setLinks(Links links) { this.links = links; }

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

        public Links() {}

        public String getSelf() { return self; }
        public void setSelf(String self) { this.self = self; }

        public String getFirst() { return first; }
        public void setFirst(String first) { this.first = first; }

        public String getLast() { return last; }
        public void setLast(String last) { this.last = last; }
    }
}
