package com.siamcode.backend.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record WeeklySummaryResponse(
        Long id,
        Long teamId,
        LocalDate weekStartDate,
        LocalDate weekEndDate,
        String summaryText,
        boolean sentToOwner,
        LocalDateTime createdAt) {
}
