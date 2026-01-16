package com.officely.backend.api.errors;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ErrorResponse {
    private List<RequestError> errors;
}
