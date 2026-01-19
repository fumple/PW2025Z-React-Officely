package com.officely.backend.api.throwables;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ValidationException extends Throwable {
    public ValidationException(String field, String message) {
        super(message);
        this.field = field;
    }
    public final String field;
}
