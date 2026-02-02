package com.officely.backend.api.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = AgeValidator.class)
@Target({ ElementType.FIELD })
@Retention(RetentionPolicy.RUNTIME)
public @interface Age {

    String message() default "The user must be at least {min} years old";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    int min();
}