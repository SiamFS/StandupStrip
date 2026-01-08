package com.siamcode.backend.service;

import com.siamcode.backend.dto.request.AddTeamMemberRequest;
import com.siamcode.backend.dto.request.CreateTeamRequest;
import com.siamcode.backend.dto.request.UpdateTeamRequest;
import com.siamcode.backend.dto.response.TeamResponse;
import com.siamcode.backend.dto.response.UserResponse;
import com.siamcode.backend.entity.Team;
import com.siamcode.backend.entity.TeamMember;
import com.siamcode.backend.entity.User;
import com.siamcode.backend.entity.InvitationStatus;
import com.siamcode.backend.exception.BadRequestException;
import com.siamcode.backend.exception.ResourceNotFoundException;
import com.siamcode.backend.exception.UnauthorizedException;
import com.siamcode.backend.repository.TeamRepository;
import com.siamcode.backend.repository.TeamMemberRepository;
import com.siamcode.backend.repository.UserRepository;
import com.siamcode.backend.util.EntityMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final EntityMapper entityMapper;

    @Transactional
    public TeamResponse createTeam(CreateTeamRequest request, Long ownerUserId) {
        Team team = new Team();
        team.setName(request.getName());
        team.setDescription(request.getDescription());
        team.setOwnerUserId(ownerUserId);
        team.setDeleted(false);

        Team savedTeam = teamRepository.save(team);

        // Add owner as a team member with OWNER role
        TeamMember ownerMember = new TeamMember();
        ownerMember.setTeamId(savedTeam.getId());
        ownerMember.setUserId(ownerUserId);
        ownerMember.setRole("OWNER");
        ownerMember.setStatus(InvitationStatus.ACCEPTED);
        ownerMember.setInvitedAt(LocalDateTime.now());
        ownerMember.setRespondedAt(LocalDateTime.now());
        teamMemberRepository.save(ownerMember);

        return entityMapper.toTeamResponse(savedTeam);
    }

    public List<TeamResponse> getTeamsByUser(Long userId) {
        // Get all team IDs where user is an ACCEPTED member
        List<Long> teamIds = teamMemberRepository.findByUserId(userId)
                .stream()
                .filter(member -> member.getStatus() == InvitationStatus.ACCEPTED)
                .map(TeamMember::getTeamId)
                .collect(Collectors.toList());

        // Get all teams that are not deleted
        return teamRepository.findAllById(teamIds).stream()
                .filter(team -> !team.isDeleted())
                .map(entityMapper::toTeamResponse)
                .collect(Collectors.toList());
    }

    public TeamResponse getTeamById(Long teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + teamId));

        if (team.isDeleted()) {
            throw new ResourceNotFoundException("Team has been deleted");
        }

        return entityMapper.toTeamResponse(team);
    }

    @Transactional
    public TeamResponse updateTeam(Long teamId, UpdateTeamRequest request, Long currentUserId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + teamId));

        if (team.isDeleted()) {
            throw new BadRequestException("Cannot update deleted team");
        }

        // Only owner can update
        if (!team.getOwnerUserId().equals(currentUserId)) {
            throw new UnauthorizedException("Only team owner can update the team");
        }

        team.setName(request.getName());
        team.setDescription(request.getDescription());
        Team updatedTeam = teamRepository.save(team);
        return entityMapper.toTeamResponse(updatedTeam);
    }

    @Transactional
    public void deleteTeam(Long teamId, Long currentUserId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + teamId));

        // Only owner can delete
        if (!team.getOwnerUserId().equals(currentUserId)) {
            throw new UnauthorizedException("Only team owner can delete the team");
        }

        // Soft delete
        team.setDeleted(true);
        teamRepository.save(team);
    }

    @Transactional
    public void addMember(Long teamId, AddTeamMemberRequest request, Long currentUserId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + teamId));

        if (team.isDeleted()) {
            throw new BadRequestException("Cannot add members to deleted team");
        }

        // Only owner can add members
        if (!team.getOwnerUserId().equals(currentUserId)) {
            throw new UnauthorizedException("Only team owner can add members");
        }

        // Find user by email (case-insensitive)
        User user = userRepository.findByEmailIgnoreCase(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        // Check if already an ACCEPTED member (PENDING is okay - they can be
        // re-invited)
        teamMemberRepository.findByTeamIdAndUserId(teamId, user.getId()).ifPresent(existingMember -> {
            if (existingMember.getStatus() == InvitationStatus.ACCEPTED) {
                throw new BadRequestException("User is already a member of this team");
            }
            // If PENDING or REJECTED, we'll update the existing record below
        });

        // Create or update PENDING invitation
        TeamMember member = teamMemberRepository.findByTeamIdAndUserId(teamId, user.getId())
                .orElse(new TeamMember());

        member.setTeamId(teamId);
        member.setUserId(user.getId());
        member.setRole(request.getRole() != null ? request.getRole() : "MEMBER");
        member.setStatus(InvitationStatus.PENDING);
        member.setInvitedAt(LocalDateTime.now());
        member.setRespondedAt(null); // Reset responded date
        teamMemberRepository.save(member);

        // Send invitation email
        try {
            User owner = userRepository.findById(team.getOwnerUserId()).orElse(null);
            String ownerName = owner != null ? owner.getName() : "A teammate";
            emailService.sendTeamInvitationEmail(user.getEmail(), team.getName(), team.getInviteCode(), ownerName);
        } catch (Exception e) {
            // Log but don't fail the add operation
            System.err.println("Failed to send team invitation email: " + e.getMessage());
        }
    }

    @Transactional
    public void removeMember(Long teamId, Long userId, Long currentUserId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + teamId));

        // Only owner can remove members
        if (!team.getOwnerUserId().equals(currentUserId)) {
            throw new UnauthorizedException("Only team owner can remove members");
        }

        // Cannot remove owner
        if (userId.equals(team.getOwnerUserId())) {
            throw new BadRequestException("Cannot remove team owner");
        }

        teamMemberRepository.deleteByTeamIdAndUserId(teamId, userId);
    }

    public boolean isTeamMember(Long userId, Long teamId) {
        return teamMemberRepository.findByTeamIdAndUserId(teamId, userId)
                .map(member -> member.getStatus() == InvitationStatus.ACCEPTED)
                .orElse(false);
    }

    public List<UserResponse> getTeamMembers(Long teamId) {
        // Find all ACCEPTED team members
        List<TeamMember> members = teamMemberRepository.findByTeamId(teamId)
                .stream()
                .filter(member -> member.getStatus() == InvitationStatus.ACCEPTED)
                .collect(Collectors.toList());

        if (members.isEmpty()) {
            return List.of();
        }

        // Get user IDs
        List<Long> userIds = members.stream()
                .map(TeamMember::getUserId)
                .collect(Collectors.toList());

        // Fetch users
        List<User> users = userRepository.findAllById(userIds);

        // Map to UserResponse
        return users.stream()
                .map(entityMapper::toUserResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get team member entities (for internal service use)
     */
    public List<User> getTeamMemberEntities(Long teamId) {
        List<TeamMember> members = teamMemberRepository.findByTeamId(teamId)
                .stream()
                .filter(member -> member.getStatus() == InvitationStatus.ACCEPTED)
                .collect(Collectors.toList());

        if (members.isEmpty()) {
            return List.of();
        }

        List<Long> userIds = members.stream()
                .map(TeamMember::getUserId)
                .collect(Collectors.toList());

        return userRepository.findAllById(userIds);
    }

    public TeamResponse getTeamByInviteCode(String inviteCode) {
        Team team = teamRepository.findByInviteCodeAndDeletedFalse(inviteCode)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid invite code"));
        return entityMapper.toTeamResponse(team);
    }

    @Transactional
    public void joinTeamByCode(String inviteCode, Long userId) {
        Team team = teamRepository.findByInviteCodeAndDeletedFalse(inviteCode)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid invite code"));

        // Check if already an ACCEPTED member (PENDING means they have an invite to
        // accept)
        teamMemberRepository.findByTeamIdAndUserId(team.getId(), userId).ifPresent(existingMember -> {
            if (existingMember.getStatus() == InvitationStatus.ACCEPTED) {
                throw new BadRequestException("You are already a member of this team");
            }
            if (existingMember.getStatus() == InvitationStatus.PENDING) {
                throw new BadRequestException(
                        "You already have a pending invitation to this team. Please accept it from your dashboard.");
            }
        });

        TeamMember member = new TeamMember();
        member.setTeamId(team.getId());
        member.setUserId(userId);
        member.setRole("MEMBER");
        member.setStatus(InvitationStatus.ACCEPTED);
        member.setInvitedAt(LocalDateTime.now());
        member.setRespondedAt(LocalDateTime.now());
        teamMemberRepository.save(member);
    }

    @Transactional
    public void acceptInvitation(Long teamId, Long userId) {
        TeamMember member = teamMemberRepository.findByTeamIdAndUserId(teamId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found"));

        if (member.getStatus() != InvitationStatus.PENDING) {
            throw new BadRequestException("Invitation is not pending");
        }

        member.setStatus(InvitationStatus.ACCEPTED);
        member.setRespondedAt(LocalDateTime.now());
        teamMemberRepository.save(member);
    }

    @Transactional
    public void rejectInvitation(Long teamId, Long userId) {
        TeamMember member = teamMemberRepository.findByTeamIdAndUserId(teamId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found"));

        if (member.getStatus() != InvitationStatus.PENDING) {
            throw new BadRequestException("Invitation is not pending");
        }

        member.setStatus(InvitationStatus.REJECTED);
        member.setRespondedAt(LocalDateTime.now());
        teamMemberRepository.save(member);
    }

    public List<UserResponse> getPendingInvitations(Long teamId, Long currentUserId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));

        // Only owner can see pending invitations
        if (!team.getOwnerUserId().equals(currentUserId)) {
            throw new UnauthorizedException("Only team owner can view pending invitations");
        }

        List<TeamMember> pendingMembers = teamMemberRepository.findByTeamId(teamId)
                .stream()
                .filter(member -> member.getStatus() == InvitationStatus.PENDING)
                .collect(Collectors.toList());

        if (pendingMembers.isEmpty()) {
            return List.of();
        }

        List<Long> userIds = pendingMembers.stream()
                .map(TeamMember::getUserId)
                .collect(Collectors.toList());

        List<User> users = userRepository.findAllById(userIds);

        return users.stream()
                .map(entityMapper::toUserResponse)
                .collect(Collectors.toList());
    }

    public List<TeamResponse> getUserPendingInvitations(Long userId) {
        // Get all PENDING team memberships for this user
        List<TeamMember> pendingMembers = teamMemberRepository.findByUserId(userId)
                .stream()
                .filter(member -> member.getStatus() == InvitationStatus.PENDING)
                .collect(Collectors.toList());

        if (pendingMembers.isEmpty()) {
            return List.of();
        }

        // Get team IDs
        List<Long> teamIds = pendingMembers.stream()
                .map(TeamMember::getTeamId)
                .collect(Collectors.toList());

        // Fetch teams and filter out deleted ones
        return teamRepository.findAllById(teamIds).stream()
                .filter(team -> !team.isDeleted())
                .map(entityMapper::toTeamResponse)
                .collect(Collectors.toList());
    }
}
