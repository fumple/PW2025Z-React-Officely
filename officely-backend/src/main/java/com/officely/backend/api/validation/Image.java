package com.officely.backend.api.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = ImageValidator.class)
@Target({ElementType.TYPE_USE, ElementType.FIELD })
@Retention(RetentionPolicy.RUNTIME)
public @interface Image {

    String message() default "The file must be an image, accepted file types are .png, .jpg, .webp";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}