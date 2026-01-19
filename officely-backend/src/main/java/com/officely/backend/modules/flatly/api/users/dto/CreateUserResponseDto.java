package com.officely.backend.modules.flatly.api.users.dto;

public class CreateUserResponseDto {
    private String id;

    public CreateUserResponseDto() {}

    public CreateUserResponseDto(String id) {
        this.id = id;
    }

    public String getId() { return id; }
}
