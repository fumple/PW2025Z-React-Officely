package com.officely.backend.api.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.time.LocalDate;

public class AgeValidator implements ConstraintValidator<Age, LocalDate> {
    private int min;
    @Override
    public void initialize(Age constraintAnnotation) {
        min = constraintAnnotation.min();
    }

    @Override
    public boolean isValid(LocalDate localDate, ConstraintValidatorContext constraintValidatorContext) {
        var expectedEarlierThan = LocalDate.now().minusYears(min);
        return !localDate.isAfter(expectedEarlierThan);
    }
}
