package com.siamcode.backend.util;

import com.siamcode.backend.dto.response.*;
import com.siamcode.backend.entity.*;
import org.springframework.stereotype.Component;

@Component
public class EntityMapper {

    public UserResponse toUserResponse(User user) {
        if (user == null)
            return null;
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.isVerified(),
                user.getCreatedAt());
    }

    public TeamResponse toTeamResponse(Team team) {
        if (team == null)
            return null;
        return new TeamResponse(
                team.getId(),
                team.getName(),
                team.getOwnerUserId(),
                team.getCreatedAt(),
                team.getInviteCode());
    }

    public StandupResponse toStandupResponse(Standup standup, String userName) {
        if (standup == null)
            return null;
        return new StandupResponse(
                standup.getId(),
                standup.getTeamId(),
                standup.getUserId(),
                userName,
                standup.getDate(),
                standup.getYesterdayText(),
                standup.getTodayText(),
                standup.getBlockersText(),
                standup.getCreatedAt(),
                standup.getUpdatedAt());
    }

    public StandupSummaryResponse toStandupSummaryResponse(StandupSummary summary) {
        if (summary == null)
            return null;
        return new StandupSummaryResponse(
                summary.getId(),
                summary.getTeamId(),
                summary.getDate(),
                summary.getSummaryText(),
                summary.isGeneratedByAi(),
                summary.getCreatedAt());
    }
}
