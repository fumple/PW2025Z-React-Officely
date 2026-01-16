package com.officely.backend.api.users.mapper;

import com.officely.backend.api.users.dto.UserDto;
import com.officely.backend.entity.UserEntity;

public class UserMapper {
    public static UserDto toDto(UserEntity entity){
        UserDto dto = new UserDto();

        String userId = entity.getId().toString();

        dto.setId(userId);
        dto.setFirstName(entity.getFirstName());
        dto.setLastName(entity.getLastName());
        dto.setEmail(entity.getEmail());
        dto.setDateOfBirth(entity.getDateOfBirth());
        dto.setNationality(entity.getNationality());
        dto.setPhoneNumber(entity.getPhoneNumber());

        UserDto.Links links = new UserDto.Links();
        links.setSelf("/users/" + userId);
        links.setUpdate("/users/" + userId);
        links.setBookings("/users/" + userId + "/bookings");
        dto.setLinks(links);

        return dto;
    }
}
