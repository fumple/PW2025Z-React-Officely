package com.officely.backend.modules.admin.api.users;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.officely.backend.api.pagination.PaginationDto;
import lombok.Getter;
import lombok.Setter;
import org.springframework.hateoas.RepresentationModel;

import java.util.List;

@Getter
@Setter
public class UsersResponse extends RepresentationModel<UsersResponse> {
    private List<UserDto> results;
    @JsonProperty("_pagination")
    private PaginationDto pagination;
}
