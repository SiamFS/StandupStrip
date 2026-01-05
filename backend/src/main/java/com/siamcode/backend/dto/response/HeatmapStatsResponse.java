package com.siamcode.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HeatmapStatsResponse {
    private LocalDate date;
    private Long count;
    private int level; // 0-4 intensity for GitHub style
}
