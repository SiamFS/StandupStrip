package com.siamcode.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateStandupRequest {
    private String yesterdayText;
    private String todayText;
    private String blockersText;
}
