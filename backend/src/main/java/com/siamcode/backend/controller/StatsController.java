package com.siamcode.backend.controller;

import com.siamcode.backend.dto.response.HeatmapStatsResponse;
import com.siamcode.backend.security.SecurityHelper;
import com.siamcode.backend.service.StandupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001",
        "http://localhost:5173" }, allowCredentials = "true")
public class StatsController {

    private final StandupService standupService;
    private final SecurityHelper securityHelper;

    @GetMapping("/teams/{teamId}/heatmap")
    public ResponseEntity<List<HeatmapStatsResponse>> getTeamHeatmap(@PathVariable Long teamId) {
        Long currentUserId = securityHelper.getCurrentUserId();
        return ResponseEntity.ok(standupService.getHeatmapStats(teamId, currentUserId));
    }
}
