package com.officely.backend.api.users.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class UsersResponseDto {
    private List<UserDto> users;

    @JsonProperty("_links")
    private Links links;

    public UsersResponseDto() {}

    public UsersResponseDto(List<UserDto> users, Links links){
        this.users = users;
        this.links = links;
    }

    public List<UserDto> getUsers() { return users; }
    public void setUsers(List<UserDto> users) { this.users = users; }

    public Links getLinks() { return links; }
    public void setLinks(Links links) { this.links = links; }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Links {
        private String create;

        public String getCreate() { return create; }
        public void setCreate(String create) { this.create = create; }
    }
}
