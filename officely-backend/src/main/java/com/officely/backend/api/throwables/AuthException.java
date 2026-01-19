package com.officely.backend.api.throwables;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthException extends Throwable {
    public AuthException(String message) {
        super(message);
    }
}
