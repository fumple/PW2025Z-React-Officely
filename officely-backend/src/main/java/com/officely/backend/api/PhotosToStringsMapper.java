package com.officely.backend.api;

import com.officely.backend.entity.OfficePhotoEntity;
import com.officely.backend.modules.uploads.controller.UploadsController;

import java.util.List;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

public abstract class PhotosToStringsMapper {
    public static List<String> mapOfficePhotos(List<OfficePhotoEntity> photoEntities) {
        return photoEntities.stream()
                .map(e -> linkTo(methodOn(UploadsController.class).getFile(e.getFilename()))
                        .toString()
                ).toList();
    }
}
