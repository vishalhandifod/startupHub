package com.startuphub.controller;

import com.startuphub.dto.UploadResponse;
import com.startuphub.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
public class UploadController {

    private final FileStorageService fileStorageService;

    @PostMapping("/profile-photo")
    public ResponseEntity<UploadResponse> uploadProfilePhoto(@RequestParam("file") MultipartFile file) {
        validateFile(file);
        return ResponseEntity.ok(fileStorageService.store(file, "profile-photo"));
    }

    @PostMapping("/post-image")
    public ResponseEntity<UploadResponse> uploadPostImage(@RequestParam("file") MultipartFile file) {
        validateFile(file);
        return ResponseEntity.ok(fileStorageService.store(file, "post-image"));
    }

    @PostMapping("/startup-logo")
    public ResponseEntity<UploadResponse> uploadStartupLogo(@RequestParam("file") MultipartFile file) {
        validateFile(file);
        return ResponseEntity.ok(fileStorageService.store(file, "startup-logo"));
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }
    }
}
