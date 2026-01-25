package com.officely.backend.api.errors;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InvalidBodyError implements RequestError {
    private final String type = "InvalidBodyError";
}
