package com.officely.backend;

import com.officely.backend.api.errors.AuthError;
import com.officely.backend.api.throwables.AuthException;
import com.officely.backend.api.errors.ErrorResponse;
import com.officely.backend.api.errors.ValidationError;
import com.officely.backend.api.throwables.ValidationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.List;
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

    @ExceptionHandler(AuthException.class)
    public ResponseEntity<ErrorResponse> handleAuthError(AuthException ex) {
        var response = new ErrorResponse();
        var error = new AuthError();
        error.setMessage(ex.getMessage());
        response.setErrors(List.of(error));
        return ResponseEntity.badRequest().body(response);
    }
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidationError(ValidationException ex) {
        var response = new ErrorResponse();
        var error = new ValidationError();
        error.setMessage(ex.getMessage());
        error.setField(ex.getField());
        response.setErrors(List.of(error));
        return ResponseEntity.badRequest().body(response);
    }
}
