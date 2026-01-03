package com.siamcode.backend.service;

import com.siamcode.backend.dto.request.CreateStandupRequest;
import com.siamcode.backend.dto.response.StandupResponse;
import com.siamcode.backend.entity.Standup;
import com.siamcode.backend.entity.User;
import com.siamcode.backend.exception.BadRequestException;
import com.siamcode.backend.exception.ResourceNotFoundException;
import com.siamcode.backend.exception.UnauthorizedException;
import com.siamcode.backend.repository.StandupRepository;
import com.siamcode.backend.repository.UserRepository;
import com.siamcode.backend.util.EntityMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StandupService {

    private final StandupRepository standupRepository;
    private final UserRepository userRepository;
    private final TeamService teamService;
    private final EntityMapper entityMapper;

    @Transactional
    public StandupResponse createStandup(Long teamId, Long userId, CreateStandupRequest request) {
        // Verify user is a team member
        if (!teamService.isTeamMember(userId, teamId)) {
            throw new UnauthorizedException("You are not a member of this team");
        }

        LocalDate today = LocalDate.now();

        // Check if standup already exists for today
        if (standupRepository.findByTeamIdAndUserIdAndDate(teamId, userId, today).isPresent()) {
            throw new BadRequestException("Standup already submitted for today");
        }

        Standup standup = new Standup();
        standup.setTeamId(teamId);
        standup.setUserId(userId);
        standup.setDate(today);
        standup.setYesterdayText(request.getYesterdayText());
        standup.setTodayText(request.getTodayText());
        standup.setBlockersText(request.getBlockersText());

        Standup savedStandup = standupRepository.save(standup);
        String userName = getUserName(userId);
        return entityMapper.toStandupResponse(savedStandup, userName);
    }

    @Transactional
    public StandupResponse updateStandup(Long standupId, Long currentUserId, CreateStandupRequest request) {
        Standup standup = standupRepository.findById(standupId)
                .orElseThrow(() -> new ResourceNotFoundException("Standup not found with id: " + standupId));

        // Only owner can update
        if (!standup.getUserId().equals(currentUserId)) {
            throw new UnauthorizedException("You can only update your own standups");
        }

        // Only allow updates on the same day
        if (!standup.getDate().equals(LocalDate.now())) {
            throw new BadRequestException("Can only update today's standup");
        }

        standup.setYesterdayText(request.getYesterdayText());
        standup.setTodayText(request.getTodayText());
        standup.setBlockersText(request.getBlockersText());

        Standup updatedStandup = standupRepository.save(standup);
        String userName = getUserName(currentUserId);
        return entityMapper.toStandupResponse(updatedStandup, userName);
    }

    public List<StandupResponse> getStandupsByTeamAndDate(Long teamId, LocalDate date, Long currentUserId) {
        // Verify user is a team member
        if (!teamService.isTeamMember(currentUserId, teamId)) {
            throw new UnauthorizedException("You are not a member of this team");
        }

        return standupRepository.findByTeamIdAndDate(teamId, date).stream()
                .map(standup -> {
                    String userName = getUserName(standup.getUserId());
                    return entityMapper.toStandupResponse(standup, userName);
                })
                .collect(Collectors.toList());
    }

    public List<StandupResponse> getStandupsByDateRange(Long teamId, LocalDate startDate, LocalDate endDate,
            Long currentUserId) {
        // Verify user is a team member
        if (!teamService.isTeamMember(currentUserId, teamId)) {
            throw new UnauthorizedException("You are not a member of this team");
        }

        if (startDate.isAfter(endDate)) {
            throw new BadRequestException("Start date must be before or equal to end date");
        }

        return standupRepository.findByTeamIdAndDateBetween(teamId, startDate, endDate).stream()
                .map(standup -> {
                    String userName = getUserName(standup.getUserId());
                    return entityMapper.toStandupResponse(standup, userName);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteStandup(Long standupId, Long currentUserId) {
        Standup standup = standupRepository.findById(standupId)
                .orElseThrow(() -> new ResourceNotFoundException("Standup not found with id: " + standupId));

        // Only owner can delete
        if (!standup.getUserId().equals(currentUserId)) {
            throw new UnauthorizedException("You can only delete your own standups");
        }

        standupRepository.delete(standup);
    }

    public List<Standup> getStandupsForSummary(Long teamId, LocalDate date) {
        return standupRepository.findByTeamIdAndDate(teamId, date);
    }

    public java.util.List<com.siamcode.backend.dto.response.HeatmapStatsResponse> getHeatmapStats(Long teamId,
            Long currentUserId) {
        // Verify user is a team member
        if (!teamService.isTeamMember(currentUserId, teamId)) {
            throw new UnauthorizedException("You are not a member of this team");
        }

        LocalDate oneYearAgo = LocalDate.now().minusYears(1);
        List<Object[]> dailyCounts = standupRepository.countDailyStandupsByTeamId(teamId, oneYearAgo);

        return dailyCounts.stream()
                .map(row -> {
                    LocalDate date = (LocalDate) row[0];
                    Long count = (Long) row[1];
                    int level = calculateLevel(count);
                    return new com.siamcode.backend.dto.response.HeatmapStatsResponse(date, count, level);
                })
                .collect(Collectors.toList());
    }

    private int calculateLevel(Long count) {
        if (count <= 0)
            return 0;
        if (count <= 2)
            return 1;
        if (count <= 5)
            return 2;
        if (count <= 8)
            return 3;
        return 4;
    }

    private String getUserName(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return user.getName();
    }
}
