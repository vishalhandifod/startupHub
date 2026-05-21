package com.startuphub.controller;

import com.startuphub.dto.CreateStartupRequest;
import com.startuphub.dto.StartupResponse;
import com.startuphub.dto.StartupSummaryResponse;
import com.startuphub.dto.UpdateStartupRequest;
import com.startuphub.service.StartupService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/startups")
@RequiredArgsConstructor
public class StartupController {

    private final StartupService startupService;

    @PostMapping
    public ResponseEntity<StartupResponse> createStartup(@Valid @RequestBody CreateStartupRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(startupService.createStartup(request));
    }

    @PutMapping("/{startupId}")
    public ResponseEntity<StartupResponse> updateStartup(
        @PathVariable Long startupId,
        @Valid @RequestBody UpdateStartupRequest request
    ) {
        return ResponseEntity.ok(startupService.updateStartup(startupId, request));
    }

    @GetMapping("/{startupId}")
    public ResponseEntity<StartupResponse> getStartup(@PathVariable Long startupId) {
        return ResponseEntity.ok(startupService.getStartup(startupId));
    }

    @GetMapping
    public ResponseEntity<List<StartupSummaryResponse>> listStartups() {
        return ResponseEntity.ok(startupService.listStartups());
    }

    @PostMapping("/{startupId}/follow")
    public ResponseEntity<StartupResponse> followStartup(@PathVariable Long startupId) {
        return ResponseEntity.ok(startupService.followStartup(startupId));
    }

    @DeleteMapping("/{startupId}/follow")
    public ResponseEntity<StartupResponse> unfollowStartup(@PathVariable Long startupId) {
        return ResponseEntity.ok(startupService.unfollowStartup(startupId));
    }
}
