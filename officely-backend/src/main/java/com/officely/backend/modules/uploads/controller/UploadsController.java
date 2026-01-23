package com.officely.backend.modules.uploads.controller;

import com.officely.backend.storage.StorageFileNotFoundException;
import com.officely.backend.storage.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/uploads")
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class UploadsController {
    private final StorageService storageService;

    @GetMapping("/{filename}")
    public ResponseEntity<Resource> getFile(@PathVariable String filename) {
        try {
            var file = storageService.loadAsResource(filename);
            // TODO: Shouldn't cause a download?
            return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=\"" + file.getFilename() + "\"").body(file);
        } catch (StorageFileNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }
}
