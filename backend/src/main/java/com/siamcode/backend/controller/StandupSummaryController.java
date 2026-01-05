package com.siamcode.backend.controller;

import com.siamcode.backend.dto.response.StandupSummaryResponse;
import com.siamcode.backend.security.SecurityHelper;
import com.siamcode.backend.service.StandupSummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/summaries")
@RequiredArgsConstructor
public class StandupSummaryController {

    private final StandupSummaryService standupSummaryService;
    private final SecurityHelper securityHelper;

    @PostMapping("/teams/{teamId}/generate")
    public ResponseEntity<StandupSummaryResponse> generateSummary(
            @PathVariable Long teamId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        Long currentUserId = securityHelper.getCurrentUserId();
        StandupSummaryResponse response = standupSummaryService.generateSummary(teamId, date, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/teams/{teamId}")
    public ResponseEntity<StandupSummaryResponse> getSummaryByDate(
            @PathVariable Long teamId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        Long currentUserId = securityHelper.getCurrentUserId();
        StandupSummaryResponse response = standupSummaryService.getSummaryByTeamAndDate(teamId, date, currentUserId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/teams/{teamId}/range")
    public ResponseEntity<List<StandupSummaryResponse>> getSummariesByDateRange(
            @PathVariable Long teamId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Long currentUserId = securityHelper.getCurrentUserId();
        List<StandupSummaryResponse> summaries = standupSummaryService.getSummariesByDateRange(teamId, startDate,
                endDate, currentUserId);
        return ResponseEntity.ok(summaries);
    }
}
