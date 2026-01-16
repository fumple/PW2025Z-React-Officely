package com.officely.backend.api.errors;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ValidationError implements RequestError {
    private final String type = "ValidationError";
    private String field;
    private String message;
}
