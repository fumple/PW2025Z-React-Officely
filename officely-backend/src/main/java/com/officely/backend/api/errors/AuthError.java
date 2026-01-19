package com.officely.backend.api.errors;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthError implements RequestError {
    private final String type = "AuthError";
    private String message;
}
