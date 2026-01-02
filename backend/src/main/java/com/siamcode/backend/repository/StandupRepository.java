package com.siamcode.backend.repository;

import com.siamcode.backend.entity.Standup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface StandupRepository extends JpaRepository<Standup, Long> {
    List<Standup> findByTeamIdAndDate(Long teamId, LocalDate date);

    List<Standup> findByTeamIdAndDateBetween(Long teamId, LocalDate startDate, LocalDate endDate);

    Optional<Standup> findByTeamIdAndUserIdAndDate(Long teamId, Long userId, LocalDate date);
}
