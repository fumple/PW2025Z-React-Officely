package com.officely.backend.api.throwables;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ValidationException extends RuntimeException {
    public ValidationException(String field, String message) {
        super(message);
        this.field = field;
    }
    public final String field;
}
