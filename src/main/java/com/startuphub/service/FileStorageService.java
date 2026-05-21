package com.startuphub.service;

import com.startuphub.config.WebProperties;
import com.startuphub.dto.UploadResponse;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class FileStorageService {

    private final WebProperties webProperties;

    public UploadResponse store(MultipartFile file, String category) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }

        try {
            Path root = Paths.get(webProperties.getUploadDir()).toAbsolutePath().normalize();
            Path categoryDir = root.resolve(category).normalize();
            Files.createDirectories(categoryDir);

            String extension = StringUtils.getFilenameExtension(file.getOriginalFilename());
            String filename = UUID.randomUUID() + (extension != null ? "." + extension : "");
            Path target = categoryDir.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            String prefix = webProperties.getUploadUrlPrefix();
            String normalizedPrefix = (prefix == null || prefix.isBlank()) ? "/uploads" : prefix;
            if (!normalizedPrefix.startsWith("/")) {
                normalizedPrefix = "/" + normalizedPrefix;
            }
            return new UploadResponse(normalizedPrefix + "/" + category + "/" + filename);
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to store file", ex);
        }
    }
}
