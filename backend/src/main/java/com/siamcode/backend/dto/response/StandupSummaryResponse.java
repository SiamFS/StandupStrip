package com.siamcode.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StandupSummaryResponse {
    private Long id;
    private Long teamId;
    private LocalDate date;
    private String summaryText;
    private boolean generatedByAi;
    private LocalDateTime createdAt;
}
