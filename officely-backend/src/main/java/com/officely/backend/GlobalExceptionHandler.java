package com.officely.backend;

import com.officely.backend.api.errors.ErrorResponse;
import com.officely.backend.api.errors.ValidationError;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(MethodArgumentNotValidException ex) {
        var response = new ErrorResponse();
        response.setErrors(ex.getBindingResult().getFieldErrors().stream().map(e -> {
            var v = new ValidationError();
            v.setField(e.getField());
            v.setMessage(e.getDefaultMessage());
            return v;
        }).collect(Collectors.toUnmodifiableList()));
        return ResponseEntity.badRequest().body(response);
    }
}
