package com.officely.backend.api.bookings.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.officely.backend.entity.BookingStatus;

import java.time.Instant;
import java.time.LocalDate;

public class BookingDto {
    private String id;
    private String officeId;
    private String itemId;
    private String offerId;
    private BookingStatus status;
    private Instant creationDate;
    private LocalDate startDate;
    private LocalDate endDate;
    private String cancellationReason;
    private Integer totalPrice;
    private PaymentDto paymentInfo;

    @JsonProperty("_links")
    private Links links;

    public BookingDto() {}

    public BookingDto(String id, String officeId, String itemId, String offerId,
                      BookingStatus status, Instant creationDate, LocalDate startDate,
                      LocalDate endDate, String cancellationReason, Integer totalPrice,
                      PaymentDto paymentInfo, Links links){
        this.id = id;
        this.officeId = officeId;
        this.itemId = itemId;
        this.offerId = offerId;
        this.status = status;
        this.creationDate = creationDate;
        this.startDate = startDate;
        this.endDate = endDate;
        this.cancellationReason  = cancellationReason;
        this.totalPrice = totalPrice;
        this.paymentInfo = paymentInfo;
        this.links = links;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getOfficeId() { return officeId; }
    public void setOfficeId(String officeId) { this.officeId = officeId; }

    public String getItemId() { return itemId; }
    public void setItemId(String itemId) { this.itemId = itemId; }

    public String getOfferId() { return offerId; }
    public void setOfferId(String offerId) { this.offerId = offerId; }

    public BookingStatus getStatus() { return status; }
    public void setStatus(BookingStatus status) { this.status = status; }

    public Instant getCreationDate() { return this.creationDate; }
    public void setCreationDate(Instant creationDate) { this.creationDate = creationDate; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }

    public Integer getTotalPrice() { return totalPrice; }
    public void setTotalPrice(Integer totalPrice) { this.totalPrice = totalPrice; }

    public PaymentDto getPaymentInfo() { return paymentInfo; }
    public void setPaymentInfo(PaymentDto paymentInfo) { this.paymentInfo = paymentInfo; }

    public Links getLinks() { return links; }
    public void setLinks(Links links) { this.links = links; }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Links {
        private String self;
        private String office;
        private String item;
        private String offer;
        private String cancel;

        public Links() {}

        public Links(String self, String office, String item, String offer, String cancel) {
            this.self = self;
            this.office = office;
            this.item = item;
            this.offer = offer;
            this.cancel = cancel;
        }

        public String getSelf() { return self; }
        public void setSelf(String self) { this.self = self; }

        public String getOffice() { return office; }
        public void setOffice(String office) { this.office = office; }

        public String getItem() { return item; }
        public void setItem(String item) { this.item = item; }

        public String getOffer() { return offer; }
        public void setOffer(String offer) { this.offer = offer; }

        public String getCancel() { return cancel; }
        public void setCancel(String cancel) { this.cancel = cancel; }
    }
}
