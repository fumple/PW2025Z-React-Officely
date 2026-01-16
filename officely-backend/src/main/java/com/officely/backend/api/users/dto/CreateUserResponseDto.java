package com.officely.backend.api.users.dto;

public class CreateUserResponseDto {
    private String id;

    public CreateUserResponseDto() {}

    public CreateUserResponseDto(String id) {
        this.id = id;
    }

    public String getId() { return id; }
}
