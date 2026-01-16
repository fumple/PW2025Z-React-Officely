package com.officely.backend.api.users.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.hateoas.RepresentationModel;

import java.util.List;

@Getter
@Setter
public class UsersResponseDto extends RepresentationModel<UsersResponseDto> {
    private List<UserDto> users;
}
