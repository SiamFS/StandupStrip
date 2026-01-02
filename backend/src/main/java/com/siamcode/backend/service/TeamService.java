package com.siamcode.backend.service;

import com.siamcode.backend.dto.request.AddTeamMemberRequest;
import com.siamcode.backend.dto.request.CreateTeamRequest;
import com.siamcode.backend.dto.request.UpdateTeamRequest;
import com.siamcode.backend.dto.response.TeamResponse;
import com.siamcode.backend.dto.response.UserResponse;
import com.siamcode.backend.entity.Team;
import com.siamcode.backend.entity.TeamMember;
import com.siamcode.backend.entity.User;
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
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final EntityMapper entityMapper;

    @Transactional
    public TeamResponse createTeam(CreateTeamRequest request, Long ownerUserId) {
        Team team = new Team();
        team.setName(request.getName());
        team.setOwnerUserId(ownerUserId);
        team.setDeleted(false);

        Team savedTeam = teamRepository.save(team);

        // Add owner as a team member with OWNER role
        TeamMember ownerMember = new TeamMember();
        ownerMember.setTeamId(savedTeam.getId());
        ownerMember.setUserId(ownerUserId);
        ownerMember.setRole("OWNER");
        teamMemberRepository.save(ownerMember);

        return entityMapper.toTeamResponse(savedTeam);
    }

    public List<TeamResponse> getTeamsByUser(Long userId) {
        // Get all team IDs where user is a member
        List<Long> teamIds = teamMemberRepository.findByUserId(userId)
                .stream()
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

        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        // Check if already a member
        if (teamMemberRepository.findByTeamIdAndUserId(teamId, user.getId()).isPresent()) {
            throw new BadRequestException("User is already a member of this team");
        }

        TeamMember member = new TeamMember();
        member.setTeamId(teamId);
        member.setUserId(user.getId());
        member.setRole(request.getRole() != null ? request.getRole() : "MEMBER");
        teamMemberRepository.save(member);
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
        return teamMemberRepository.findByTeamIdAndUserId(teamId, userId).isPresent();
    }

    public List<UserResponse> getTeamMembers(Long teamId) {
        // Find all team members
        List<TeamMember> members = teamMemberRepository.findByTeamId(teamId);

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
}
