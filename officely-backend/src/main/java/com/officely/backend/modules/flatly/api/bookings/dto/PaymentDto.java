package com.officely.backend.modules.flatly.api.bookings.dto;

import com.officely.backend.entity.PaymentStatus;

import java.time.Instant;

public class PaymentDto {
    private String accountNumber;
    private String receiverName;
    private String transferTitle;
    private Instant dueDate;
    private PaymentStatus status;

    public PaymentDto() {}

    public PaymentDto(String accountNumber, String receiverName, String transferTitle,
                      Instant dueDate, PaymentStatus status){
        this.accountNumber = accountNumber;
        this.receiverName = receiverName;
        this.transferTitle = transferTitle;
        this.dueDate = dueDate;
        this.status = status;
    }

    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }

    public String getReceiverName() { return receiverName; }
    public void setReceiverName(String receiverName) { this.receiverName = receiverName; }

    public String getTransferTitle() { return transferTitle; }
    public void setTransferTitle(String transferTitle) { this.transferTitle = transferTitle; }

    public Instant getDueDate() { return dueDate; }
    public void setDueDate(Instant dueDate) { this.dueDate = dueDate; }

    public PaymentStatus getStatus() { return status; }
    public void setStatus(PaymentStatus status) { this.status = status; }
}
