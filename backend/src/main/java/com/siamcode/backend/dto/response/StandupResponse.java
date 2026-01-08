package com.siamcode.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StandupResponse {
    private Long id;
    private Long teamId;
    private Long userId;
    private String userName;
    private LocalDate date;
    private String yesterdayText;
    private String todayText;
    private String blockersText;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
