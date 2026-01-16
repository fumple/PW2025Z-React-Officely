package com.officely.backend.api.users.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;

public class UserDto {
    private String id;
    private String firstName;
    private String lastName;
    private String email;

    private LocalDate dateOfBirth;

    @Pattern(regexp = "^[A-Z]{2}$")
    private String nationality;

    @Pattern(regexp = "^\\+[1-9]\\d{1,14}$")
    public String phoneNumber;

    @JsonProperty("_links")
    private Links links;

    public UserDto() {}

    public UserDto(String id, String firstName, String lastName, String email, LocalDate dateOfBirth, String nationality,
        String phoneNumber, Links links){
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.dateOfBirth = dateOfBirth;
        this.nationality = nationality;
        this.phoneNumber = phoneNumber;
        this.links = links;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getNationality() { return nationality; }
    public void setNationality(String nationality) { this.nationality = nationality; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public Links getLinks() { return links; }
    public void setLinks(Links links) { this.links = links; }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Links {

        private String self;
        private String update;
        private String bookings;

        public Links() {}

        public Links(String self, String update, String bookings) {
            this.self = self;
            this.update = update;
            this.bookings = bookings;
        }

        public String getSelf() { return self; }
        public void setSelf(String self) { this.self = self; }

        public String getUpdate() { return update; }
        public void setUpdate(String update) { this.update = update; }

        public String getBookings() { return bookings; }
        public void setBookings(String bookings) { this.bookings = bookings; }
    }

}
