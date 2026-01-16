package com.officely.backend.api.users.dto;

import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;

public class CreateUserRequestDto {
    private String id;
    private String firstName;
    private String lastName;
    private String email;

    private LocalDate dateOfBirth;

    @Pattern(regexp = "^[A-Z]{2}$")
    private String nationality;

    @Pattern(regexp = "^\\+[1-9]\\d{1,14}$")
    public String phoneNumber;

    public CreateUserRequestDto() {}

    public CreateUserRequestDto(String id, String firstName, String lastName, String email, LocalDate dateOfBirth, String nationality,
                   String phoneNumber){
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.dateOfBirth = dateOfBirth;
        this.nationality = nationality;
        this.phoneNumber = phoneNumber;
    }

    public String getId() { return id; }

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
}
