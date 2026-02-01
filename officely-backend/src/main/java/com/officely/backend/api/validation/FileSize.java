package com.officely.backend.api.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = FileSizeValidator.class)
@Target({ElementType.TYPE_USE, ElementType.FIELD })
@Retention(RetentionPolicy.RUNTIME)
public @interface FileSize {

    String message() default "The file must be less than {max}MB";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    long max();
}