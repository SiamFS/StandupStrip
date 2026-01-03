package com.siamcode.backend.controller;

import com.siamcode.backend.dto.response.WeeklySummaryResponse;
import com.siamcode.backend.security.SecurityHelper;
import com.siamcode.backend.service.WeeklySummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/weekly-summaries")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001",
                "http://localhost:5173" }, allowCredentials = "true")
public class WeeklySummaryController {

        private final WeeklySummaryService weeklySummaryService;
        private final SecurityHelper securityHelper;

        @PostMapping("/teams/{teamId}/generate")
        public ResponseEntity<WeeklySummaryResponse> generateWeeklySummary(
                        @PathVariable Long teamId) {
                Long currentUserId = securityHelper.getCurrentUserId();
                WeeklySummaryResponse response = weeklySummaryService.generateAndSendWeeklySummary(
                                teamId, currentUserId);
                return ResponseEntity.ok(response);
        }

        @GetMapping("/teams/{teamId}")
        public ResponseEntity<List<WeeklySummaryResponse>> getWeeklySummaries(
                        @PathVariable Long teamId) {
                Long currentUserId = securityHelper.getCurrentUserId();
                List<WeeklySummaryResponse> summaries = weeklySummaryService.getWeeklySummaries(
                                teamId, currentUserId);
                return ResponseEntity.ok(summaries);
        }

        @GetMapping("/teams/{teamId}/latest")
        public ResponseEntity<WeeklySummaryResponse> getLatestWeeklySummary(
                        @PathVariable Long teamId) {
                Long currentUserId = securityHelper.getCurrentUserId();
                WeeklySummaryResponse summary = weeklySummaryService.getLatestWeeklySummary(
                                teamId, currentUserId);
                return ResponseEntity.ok(summary);
        }
}
