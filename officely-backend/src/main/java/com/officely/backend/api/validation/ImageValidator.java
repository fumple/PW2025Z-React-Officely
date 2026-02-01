package com.officely.backend.api.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.web.multipart.MultipartFile;

public class ImageValidator implements ConstraintValidator<Image, MultipartFile> {
    @Override
    public void initialize(Image constraintAnnotation) {

    }

    public static final String[] ALLOWED_FILE_TYPES = new String[] {
            "image/png",
            "image/jpeg",
            "image/webp"
    };

    @Override
    public boolean isValid(MultipartFile file, ConstraintValidatorContext constraintValidatorContext) {
        for(var type : ALLOWED_FILE_TYPES) {
            if(type.equalsIgnoreCase(file.getContentType())) {
                return true;
            }
        }
        return false;
    }
}
