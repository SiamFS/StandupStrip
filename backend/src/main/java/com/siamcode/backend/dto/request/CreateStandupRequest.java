package com.siamcode.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateStandupRequest {
    @NotBlank(message = "Yesterday's update is required")
    @Size(max = 2000, message = "Yesterday's update must not exceed 2000 characters")
    private String yesterdayText;

    @NotBlank(message = "Today's plan is required")
    @Size(max = 2000, message = "Today's plan must not exceed 2000 characters")
    private String todayText;

    @Size(max = 1000, message = "Blockers must not exceed 1000 characters")
    private String blockersText;
}
