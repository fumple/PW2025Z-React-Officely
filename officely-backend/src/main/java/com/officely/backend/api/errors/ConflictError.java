package com.officely.backend.api.errors;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ConflictError implements RequestError {
    private final String type = "ConflictError";
    private String message;
}
