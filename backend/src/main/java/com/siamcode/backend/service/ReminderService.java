package com.siamcode.backend.service;

import com.siamcode.backend.dto.response.ReminderResponse;
import com.siamcode.backend.entity.Team;
import com.siamcode.backend.entity.User;
import com.siamcode.backend.exception.BadRequestException;
import com.siamcode.backend.exception.ResourceNotFoundException;
import com.siamcode.backend.exception.UnauthorizedException;
import com.siamcode.backend.repository.StandupRepository;
import com.siamcode.backend.repository.TeamRepository;
import com.siamcode.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ReminderService {

    private final EmailService emailService;
    private final TeamService teamService;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final StandupRepository standupRepository;

    @Value("${frontend.url:http://localhost:3000}")
    private String frontendUrl;

    public ReminderService(EmailService emailService, TeamService teamService,
            TeamRepository teamRepository, UserRepository userRepository,
            StandupRepository standupRepository) {
        this.emailService = emailService;
        this.teamService = teamService;
        this.teamRepository = teamRepository;
        this.userRepository = userRepository;
        this.standupRepository = standupRepository;
    }

    /**
     * Send a standup reminder to a specific team member
     */
    public ReminderResponse sendReminderToMember(Long teamId, Long targetUserId, Long currentUserId) {
        // Verify current user is team owner
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + teamId));

        if (!team.getOwnerUserId().equals(currentUserId)) {
            throw new UnauthorizedException("Only team owners can send reminders");
        }

        // Verify target user is a team member
        if (!teamService.isTeamMember(targetUserId, teamId)) {
            throw new BadRequestException("User is not a member of this team");
        }

        // Check if user already submitted standup today
        LocalDate today = LocalDate.now();
        if (standupRepository.findByTeamIdAndUserIdAndDate(teamId, targetUserId, today).isPresent()) {
            throw new BadRequestException("User has already submitted their standup today");
        }

        // Get user details and send email
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        sendReminderEmail(user, team);

        return new ReminderResponse(1, "Reminder sent to " + user.getName());
    }

    /**
     * Send reminders to all team members who haven't submitted standup today
     */
    public ReminderResponse sendReminderToAllPending(Long teamId, Long currentUserId) {
        // Verify current user is team owner
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + teamId));

        if (!team.getOwnerUserId().equals(currentUserId)) {
            throw new UnauthorizedException("Only team owners can send reminders");
        }

        // Get all team members
        List<User> members = teamService.getTeamMemberEntities(teamId);

        // Get today's date
        LocalDate today = LocalDate.now();

        // Find members who haven't submitted standup today
        List<User> pendingMembers = members.stream()
                .filter(member -> standupRepository.findByTeamIdAndUserIdAndDate(teamId, member.getId(), today)
                        .isEmpty())
                .collect(Collectors.toList());

        if (pendingMembers.isEmpty()) {
            return new ReminderResponse(0, "All team members have already submitted their standups");
        }

        // Send reminders to all pending members
        int emailsSent = 0;
        for (User member : pendingMembers) {
            try {
                sendReminderEmail(member, team);
                emailsSent++;
            } catch (Exception e) {
                log.error("Failed to send reminder to {}: {}", member.getEmail(), e.getMessage());
            }
        }

        String message = emailsSent == 1
                ? "Reminder sent to 1 team member"
                : "Reminders sent to " + emailsSent + " team members";

        return new ReminderResponse(emailsSent, message);
    }

    private void sendReminderEmail(User user, Team team) {
        String subject = "📋 Standup Reminder - " + team.getName();
        String submitUrl = frontendUrl + "/teams/" + team.getId() + "?submit=true";

        String htmlContent = """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #14b8a6; margin: 0;">StandUpStrip</h1>
                    </div>

                    <h2 style="color: #333;">Hi %s! 👋</h2>

                    <p style="color: #555; font-size: 16px; line-height: 1.6;">
                        This is a friendly reminder that your daily standup for <strong>%s</strong> hasn't been submitted yet.
                    </p>

                    <p style="color: #555; font-size: 16px; line-height: 1.6;">
                        Taking a few minutes to share your update helps keep the whole team aligned and informed!
                    </p>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="%s" style="background: #14b8a6; color: white; display: inline-block; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                            Submit Your Standup
                        </a>
                    </div>

                    <p style="color: #888; font-size: 14px;">
                        What to include in your standup:
                    </p>
                    <ul style="color: #666; font-size: 14px;">
                        <li>What you accomplished yesterday</li>
                        <li>What you're planning to work on today</li>
                        <li>Any blockers or challenges</li>
                    </ul>

                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />

                    <p style="color: #999; font-size: 12px; text-align: center;">
                        Sent by StandUpStrip • Daily standup made simple
                    </p>
                </div>
                """
                .formatted(user.getName(), team.getName(), submitUrl);

        emailService.sendHtmlEmail(user.getEmail(), subject, htmlContent);
        log.info("Standup reminder sent to {} for team {}", user.getEmail(), team.getName());
    }
}
