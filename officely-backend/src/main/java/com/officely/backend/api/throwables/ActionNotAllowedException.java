package com.officely.backend.api.throwables;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ActionNotAllowedException extends RuntimeException {
    public ActionNotAllowedException(String message) {
        super(message);
    }
}
