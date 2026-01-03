package com.siamcode.backend.service;

import com.siamcode.backend.dto.response.WeeklySummaryResponse;
import com.siamcode.backend.entity.Standup;
import com.siamcode.backend.entity.Team;
import com.siamcode.backend.entity.User;
import com.siamcode.backend.entity.WeeklySummary;
import com.siamcode.backend.exception.BadRequestException;
import com.siamcode.backend.exception.ResourceNotFoundException;
import com.siamcode.backend.exception.UnauthorizedException;
import com.siamcode.backend.repository.StandupRepository;
import com.siamcode.backend.repository.TeamRepository;
import com.siamcode.backend.repository.UserRepository;
import com.siamcode.backend.repository.WeeklySummaryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WeeklySummaryService {

    private final WeeklySummaryRepository weeklySummaryRepository;
    private final StandupRepository standupRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final TeamService teamService;
    private final AIService aiService;
    private final EmailService emailService;

    @Transactional
    public WeeklySummaryResponse generateAndSendWeeklySummary(Long teamId, Long currentUserId) {
        // Verify ownership
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));

        if (!team.getOwnerUserId().equals(currentUserId)) {
            throw new UnauthorizedException("Only team owner can generate weekly summaries");
        }

        // Calculate week range (last 7 days including today)
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.minusDays(6);
        LocalDate weekEnd = today;

        // Check if summary already exists for this week
        if (weeklySummaryRepository.findByTeamIdAndWeekStartDate(teamId, weekStart).isPresent()) {
            throw new BadRequestException(
                    "Weekly summary already exists for this week. Try again next week or view the existing summary.");
        }

        // Get all standups for the week
        List<Standup> standups = standupRepository.findByTeamIdAndDateBetween(teamId, weekStart, weekEnd);

        if (standups.isEmpty()) {
            throw new BadRequestException("No standups found for this week. Cannot generate summary.");
        }

        // Generate AI summary
        String summaryText = aiService.generateStandupSummary(standups);

        // Prepend week info to summary
        String fullSummary = String.format("## 📅 Weekly Summary: %s to %s\n\n**Total Standups:** %d\n\n---\n\n%s",
                weekStart, weekEnd, standups.size(), summaryText);

        // Save weekly summary
        WeeklySummary weeklySummary = new WeeklySummary();
        weeklySummary.setTeamId(teamId);
        weeklySummary.setWeekStartDate(weekStart);
        weeklySummary.setWeekEndDate(weekEnd);
        weeklySummary.setSummaryText(fullSummary);
        weeklySummary.setSentToOwner(false);

        // Send email to owner
        User owner = userRepository.findById(team.getOwnerUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Team owner not found"));

        try {
            sendWeeklySummaryEmail(owner, team, fullSummary, weekStart, weekEnd);
            weeklySummary.setSentToOwner(true);
            log.info("Weekly summary email sent to {} for team {}", owner.getEmail(), team.getName());
        } catch (Exception e) {
            log.error("Failed to send weekly summary email: {}", e.getMessage());
            // Continue saving even if email fails
        }

        WeeklySummary savedSummary = weeklySummaryRepository.save(weeklySummary);
        return toResponse(savedSummary);
    }

    public List<WeeklySummaryResponse> getWeeklySummaries(Long teamId, Long currentUserId) {
        if (!teamService.isTeamMember(currentUserId, teamId)) {
            throw new UnauthorizedException("You are not a member of this team");
        }

        return weeklySummaryRepository.findByTeamIdOrderByWeekStartDateDesc(teamId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public WeeklySummaryResponse getLatestWeeklySummary(Long teamId, Long currentUserId) {
        if (!teamService.isTeamMember(currentUserId, teamId)) {
            throw new UnauthorizedException("You are not a member of this team");
        }

        WeeklySummary summary = weeklySummaryRepository.findFirstByTeamIdOrderByWeekStartDateDesc(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("No weekly summaries found for this team"));

        return toResponse(summary);
    }

    private void sendWeeklySummaryEmail(User owner, Team team, String summary, LocalDate weekStart, LocalDate weekEnd) {
        String subject = String.format("📊 Weekly Summary for %s (%s - %s)",
                team.getName(), weekStart, weekEnd);

        String htmlContent = """
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #ffffff;">
                    <div style="background: linear-gradient(135deg, #14b8a6 0%%, #0d9488 100%%); padding: 30px; border-radius: 12px 12px 0 0;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">📊 Weekly Team Summary</h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">%s</p>
                    </div>

                    <div style="padding: 30px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-top: none;">
                        <p style="color: #475569; margin-bottom: 20px;">Hi %s,</p>
                        <p style="color: #475569; margin-bottom: 20px;">Here's your weekly standup summary for <strong>%s</strong> from %s to %s.</p>

                        <div style="background-color: white; padding: 25px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 25px;">
                            <div style="color: #1e293b; line-height: 1.6; white-space: pre-wrap;">%s</div>
                        </div>

                        <p style="color: #64748b; font-size: 14px; margin-top: 25px;">
                            This summary was generated by StandUpStrip AI.
                        </p>
                    </div>

                    <div style="padding: 20px 30px; background-color: #1e293b; border-radius: 0 0 12px 12px; text-align: center;">
                        <p style="color: #94a3b8; margin: 0; font-size: 13px;">
                            StandUpStrip - Keep your team aligned
                        </p>
                    </div>
                </div>
                """
                .formatted(
                        team.getName(),
                        owner.getName(),
                        team.getName(),
                        weekStart,
                        weekEnd,
                        summary.replace("\n", "<br/>"));

        emailService.sendHtmlEmail(owner.getEmail(), subject, htmlContent);
    }

    private WeeklySummaryResponse toResponse(WeeklySummary summary) {
        return new WeeklySummaryResponse(
                summary.getId(),
                summary.getTeamId(),
                summary.getWeekStartDate(),
                summary.getWeekEndDate(),
                summary.getSummaryText(),
                summary.isSentToOwner(),
                summary.getCreatedAt());
    }
}
