package com.officely.backend;

import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import com.officely.backend.api.errors.*;
import com.officely.backend.api.throwables.ActionNotAllowedException;
import com.officely.backend.api.throwables.AuthException;
import com.officely.backend.api.throwables.ConflictException;
import com.officely.backend.api.throwables.ValidationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;

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
    @ExceptionHandler(HandlerMethodValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidationError(HandlerMethodValidationException ex) {
        var response = new ErrorResponse();
        response.setErrors(ex.getParameterValidationResults().stream()
                .flatMap(e -> e
                        .getResolvableErrors()
                        .stream().map(err -> {
                            var v = new ValidationError();
                            v.setField(e.getMethodParameter().getParameterName());
                            v.setMessage(err.getDefaultMessage());
                            return v;
                        })).collect(Collectors.toUnmodifiableList())
        );
        return ResponseEntity.badRequest().body(response);
    }
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeErrors(MethodArgumentTypeMismatchException ex) {
        var response = new ErrorResponse();
        var v = new ValidationError();
        v.setField(ex.getParameter().getParameterName());
        v.setMessage("This paramater was not correctly formatted and couldn't be parsed as "+ex.getParameter().getParameterType().getSimpleName());
        response.setErrors(List.of(v));
        return ResponseEntity.badRequest().body(response);
    }
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponse> handleMissingParamError(MissingServletRequestParameterException ex) {
        var response = new ErrorResponse();
        var v = new ValidationError();
        v.setField(ex.getParameterName());
        v.setMessage("This paramater is required");
        response.setErrors(List.of(v));
        return ResponseEntity.badRequest().body(response);
    }
    @ExceptionHandler(MissingServletRequestPartException.class)
    public ResponseEntity<ErrorResponse> handleMissingPartError(MissingServletRequestPartException ex) {
        var response = new ErrorResponse();
        var v = new ValidationError();
        v.setField(ex.getRequestPartName());
        v.setMessage("This paramater is required");
        response.setErrors(List.of(v));
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
    @ExceptionHandler(ActionNotAllowedException.class)
    public ResponseEntity<ErrorResponse> handleConflictError(ActionNotAllowedException ex) {
        var response = new ErrorResponse();
        var error = new ActionNotAllowedError();
        error.setMessage(ex.getMessage());
        response.setErrors(List.of(error));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
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
