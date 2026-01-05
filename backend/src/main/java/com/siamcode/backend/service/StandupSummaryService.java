package com.siamcode.backend.service;

import com.siamcode.backend.dto.response.StandupSummaryResponse;
import com.siamcode.backend.entity.Standup;
import com.siamcode.backend.entity.StandupSummary;
import com.siamcode.backend.exception.BadRequestException;
import com.siamcode.backend.exception.ResourceNotFoundException;
import com.siamcode.backend.exception.UnauthorizedException;
import com.siamcode.backend.repository.StandupSummaryRepository;
import com.siamcode.backend.util.EntityMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StandupSummaryService {

    private final StandupSummaryRepository standupSummaryRepository;
    private final StandupService standupService;
    private final AIService aiService;
    private final TeamService teamService;
    private final EntityMapper entityMapper;

    @Transactional
    public StandupSummaryResponse generateSummary(Long teamId, LocalDate date, Long currentUserId) {
        // Verify user is a team member
        if (!teamService.isTeamMember(currentUserId, teamId)) {
            throw new UnauthorizedException("You are not a member of this team");
        }

        // Delete existing summary if present (for regeneration when new standups are
        // added)
        standupSummaryRepository.findByTeamIdAndDate(teamId, date)
                .ifPresent(existingSummary -> standupSummaryRepository.delete(existingSummary));

        // Get all standups for this team and date
        List<Standup> standups = standupService.getStandupsForSummary(teamId, date);

        if (standups.isEmpty()) {
            throw new BadRequestException("No standups found for this team and date");
        }

        // Generate AI summary
        String summaryText = aiService.generateStandupSummary(standups);

        // Save summary
        StandupSummary summary = new StandupSummary();
        summary.setTeamId(teamId);
        summary.setDate(date);
        summary.setSummaryText(summaryText);
        summary.setGeneratedByAi(true);

        StandupSummary savedSummary = standupSummaryRepository.save(summary);
        return entityMapper.toStandupSummaryResponse(savedSummary);
    }

    public StandupSummaryResponse getSummaryByTeamAndDate(Long teamId, LocalDate date, Long currentUserId) {
        // Verify user is a team member
        if (!teamService.isTeamMember(currentUserId, teamId)) {
            throw new UnauthorizedException("You are not a member of this team");
        }

        StandupSummary summary = standupSummaryRepository.findByTeamIdAndDate(teamId, date)
                .orElseThrow(() -> new ResourceNotFoundException("Summary not found for this team and date"));

        return entityMapper.toStandupSummaryResponse(summary);
    }

    public List<StandupSummaryResponse> getSummariesByDateRange(Long teamId, LocalDate startDate, LocalDate endDate,
            Long currentUserId) {
        // Verify user is a team member
        if (!teamService.isTeamMember(currentUserId, teamId)) {
            throw new UnauthorizedException("You are not a member of this team");
        }

        if (startDate.isAfter(endDate)) {
            throw new BadRequestException("Start date must be before or equal to end date");
        }

        return standupSummaryRepository.findByTeamIdAndDateBetween(teamId, startDate, endDate).stream()
                .map(entityMapper::toStandupSummaryResponse)
                .collect(Collectors.toList());
    }
}
