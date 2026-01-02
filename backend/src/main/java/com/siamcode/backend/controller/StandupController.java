package com.siamcode.backend.controller;

import com.siamcode.backend.dto.request.CreateStandupRequest;
import com.siamcode.backend.dto.response.StandupResponse;
import com.siamcode.backend.security.SecurityHelper;
import com.siamcode.backend.service.StandupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/standups")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001",
        "http://localhost:5173" }, allowCredentials = "true")
public class StandupController {

    private final StandupService standupService;
    private final SecurityHelper securityHelper;

    @PostMapping("/teams/{teamId}")
    public ResponseEntity<StandupResponse> createStandup(
            @PathVariable Long teamId,
            @Valid @RequestBody CreateStandupRequest request) {
        Long currentUserId = securityHelper.getCurrentUserId();
        StandupResponse response = standupService.createStandup(teamId, currentUserId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{standupId}")
    public ResponseEntity<StandupResponse> updateStandup(
            @PathVariable Long standupId,
            @Valid @RequestBody CreateStandupRequest request) {
        Long currentUserId = securityHelper.getCurrentUserId();
        StandupResponse response = standupService.updateStandup(standupId, currentUserId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/teams/{teamId}")
    public ResponseEntity<List<StandupResponse>> getStandupsByDate(
            @PathVariable Long teamId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        Long currentUserId = securityHelper.getCurrentUserId();
        List<StandupResponse> standups = standupService.getStandupsByTeamAndDate(teamId, date, currentUserId);
        return ResponseEntity.ok(standups);
    }

    @GetMapping("/teams/{teamId}/range")
    public ResponseEntity<List<StandupResponse>> getStandupsByDateRange(
            @PathVariable Long teamId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Long currentUserId = securityHelper.getCurrentUserId();
        List<StandupResponse> standups = standupService.getStandupsByDateRange(teamId, startDate, endDate,
                currentUserId);
        return ResponseEntity.ok(standups);
    }

    @DeleteMapping("/{standupId}")
    public ResponseEntity<Void> deleteStandup(@PathVariable Long standupId) {
        Long currentUserId = securityHelper.getCurrentUserId();
        standupService.deleteStandup(standupId, currentUserId);
        return ResponseEntity.noContent().build();
    }
}
