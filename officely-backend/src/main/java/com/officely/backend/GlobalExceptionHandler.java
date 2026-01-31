package com.officely.backend;

import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import com.officely.backend.api.errors.*;
import com.officely.backend.api.throwables.AuthException;
import com.officely.backend.api.throwables.ConflictException;
import com.officely.backend.api.throwables.ValidationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.ArrayList;
import java.util.Arrays;
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
    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ErrorResponse> handleConflictError(ConflictException ex) {
        var response = new ErrorResponse();
        var error = new ConflictError();
        error.setMessage(ex.getMessage());
        response.setErrors(List.of(error));
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleReadError(HttpMessageNotReadableException ex) {
        var response = new ErrorResponse();
        if(ex.getCause() instanceof InvalidFormatException cause) {
            var errors = new ArrayList<RequestError>();
            String message;
            if(cause.getTargetType().isEnum()) {
                var values = Arrays.stream(cause.getTargetType().getEnumConstants())
                        .map(Object::toString)
                        .collect(Collectors.joining(", "));
                message = "Value must be one of: "+values;
            } else {
                message = "Invalid format! Expected a "+cause.getTargetType().getSimpleName();
            }
            for(var path : cause.getPath()) {
                var error = new ValidationError();
                error.setField(path.getFieldName());
                error.setMessage(message);
                errors.add(error);
            }
            response.setErrors(errors);
        } else {
            var error = new InvalidBodyError();
            response.setErrors(List.of(error));
        }
        return ResponseEntity.badRequest().body(response);
    }
}
