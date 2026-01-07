package com.siamcode.backend.controller;

import com.siamcode.backend.dto.request.AddTeamMemberRequest;
import com.siamcode.backend.dto.request.CreateTeamRequest;
import com.siamcode.backend.dto.request.UpdateTeamRequest;
import com.siamcode.backend.dto.response.TeamResponse;
import com.siamcode.backend.dto.response.UserResponse;
import com.siamcode.backend.security.SecurityHelper;
import com.siamcode.backend.service.TeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;
    private final SecurityHelper securityHelper;

    @PostMapping
    public ResponseEntity<TeamResponse> createTeam(@RequestBody CreateTeamRequest request) {
        Long currentUserId = securityHelper.getCurrentUserId();
        TeamResponse response = teamService.createTeam(request, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<TeamResponse>> getMyTeams() {
        Long currentUserId = securityHelper.getCurrentUserId();
        List<TeamResponse> teams = teamService.getTeamsByUser(currentUserId);
        return ResponseEntity.ok(teams);
    }

    @GetMapping("/{teamId}")
    public ResponseEntity<TeamResponse> getTeamById(@PathVariable Long teamId) {
        TeamResponse team = teamService.getTeamById(teamId);
        return ResponseEntity.ok(team);
    }

    @GetMapping("/{teamId}/members")
    public ResponseEntity<List<UserResponse>> getTeamMembers(@PathVariable Long teamId) {
        List<UserResponse> members = teamService.getTeamMembers(teamId);
        return ResponseEntity.ok(members);
    }

    @PutMapping("/{teamId}")
    public ResponseEntity<TeamResponse> updateTeam(
            @PathVariable Long teamId,
            @RequestBody UpdateTeamRequest request) {
        Long currentUserId = securityHelper.getCurrentUserId();
        TeamResponse response = teamService.updateTeam(teamId, request, currentUserId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{teamId}")
    public ResponseEntity<Void> deleteTeam(@PathVariable Long teamId) {
        Long currentUserId = securityHelper.getCurrentUserId();
        teamService.deleteTeam(teamId, currentUserId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{teamId}/members")
    public ResponseEntity<Void> addMember(
            @PathVariable Long teamId,
            @RequestBody AddTeamMemberRequest request) {
        Long currentUserId = securityHelper.getCurrentUserId();
        teamService.addMember(teamId, request, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/{teamId}/members/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable Long teamId,
            @PathVariable Long userId) {
        Long currentUserId = securityHelper.getCurrentUserId();
        teamService.removeMember(teamId, userId, currentUserId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/join/{code}")
    public ResponseEntity<TeamResponse> getTeamByInviteCode(@PathVariable String code) {
        TeamResponse team = teamService.getTeamByInviteCode(code);
        return ResponseEntity.ok(team);
    }

    @PostMapping("/join/{code}")
    public ResponseEntity<Void> joinTeamByCode(@PathVariable String code) {
        Long currentUserId = securityHelper.getCurrentUserId();
        teamService.joinTeamByCode(code, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/{teamId}/invitations/accept")
    public ResponseEntity<Void> acceptInvitation(@PathVariable Long teamId) {
        Long currentUserId = securityHelper.getCurrentUserId();
        teamService.acceptInvitation(teamId, currentUserId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{teamId}/invitations/reject")
    public ResponseEntity<Void> rejectInvitation(@PathVariable Long teamId) {
        Long currentUserId = securityHelper.getCurrentUserId();
        teamService.rejectInvitation(teamId, currentUserId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{teamId}/pending-invitations")
    public ResponseEntity<List<UserResponse>> getPendingInvitations(@PathVariable Long teamId) {
        Long currentUserId = securityHelper.getCurrentUserId();
        List<UserResponse> pendingInvitations = teamService.getPendingInvitations(teamId, currentUserId);
        return ResponseEntity.ok(pendingInvitations);
    }

    @GetMapping("/my-pending-invitations")
    public ResponseEntity<List<TeamResponse>> getMyPendingInvitations() {
        Long currentUserId = securityHelper.getCurrentUserId();
        List<TeamResponse> pendingInvitations = teamService.getUserPendingInvitations(currentUserId);
        return ResponseEntity.ok(pendingInvitations);
    }
}
