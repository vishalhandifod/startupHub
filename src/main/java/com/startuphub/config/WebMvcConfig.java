package com.startuphub.config;

import java.nio.file.Path;
import java.nio.file.Paths;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private final WebProperties webProperties;

    public WebMvcConfig(WebProperties webProperties) {
        this.webProperties = webProperties;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String uploadDir = webProperties.getUploadDir();
        if (uploadDir == null || uploadDir.isBlank()) {
            uploadDir = "uploads";
        }
        Path uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
        String publicPrefix = normalizePrefix(webProperties.getUploadUrlPrefix());
        registry.addResourceHandler(publicPrefix + "/**")
            .addResourceLocations(uploadRoot.toUri().toString());
    }

    private String normalizePrefix(String prefix) {
        if (prefix == null || prefix.isBlank()) {
            return "/uploads";
        }
        return prefix.startsWith("/") ? prefix : "/" + prefix;
    }
}
