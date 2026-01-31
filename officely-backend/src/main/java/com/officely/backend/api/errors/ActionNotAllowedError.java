package com.officely.backend.api.errors;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ActionNotAllowedError implements RequestError {
    private final String type = "ActionNotAllowedError";
    private String message;
}
