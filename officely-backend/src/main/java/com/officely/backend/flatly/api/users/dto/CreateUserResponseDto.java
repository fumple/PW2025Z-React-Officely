package com.officely.backend.flatly.api.users.dto;

public class CreateUserResponseDto {
    private String id;

    public CreateUserResponseDto() {}

    public CreateUserResponseDto(String id) {
        this.id = id;
    }

    public String getId() { return id; }
}
