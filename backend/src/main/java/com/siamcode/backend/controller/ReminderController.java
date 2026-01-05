package com.siamcode.backend.controller;

import com.siamcode.backend.dto.response.ReminderResponse;
import com.siamcode.backend.security.SecurityHelper;
import com.siamcode.backend.service.ReminderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reminders")
@RequiredArgsConstructor
public class ReminderController {

    private final ReminderService reminderService;
    private final SecurityHelper securityHelper;

    /**
     * Send a standup reminder to a specific team member
     */
    @PostMapping("/teams/{teamId}/members/{userId}")
    public ResponseEntity<ReminderResponse> sendReminderToMember(
            @PathVariable Long teamId,
            @PathVariable Long userId) {
        Long currentUserId = securityHelper.getCurrentUserId();
        ReminderResponse response = reminderService.sendReminderToMember(teamId, userId, currentUserId);
        return ResponseEntity.ok(response);
    }

    /**
     * Send standup reminders to all team members who haven't submitted today
     */
    @PostMapping("/teams/{teamId}/all-pending")
    public ResponseEntity<ReminderResponse> sendReminderToAllPending(@PathVariable Long teamId) {
        Long currentUserId = securityHelper.getCurrentUserId();
        ReminderResponse response = reminderService.sendReminderToAllPending(teamId, currentUserId);
        return ResponseEntity.ok(response);
    }
}
