package com.siamcode.backend.repository;

import com.siamcode.backend.entity.StandupSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface StandupSummaryRepository extends JpaRepository<StandupSummary, Long> {
    Optional<StandupSummary> findByTeamIdAndDate(Long teamId, LocalDate date);

    List<StandupSummary> findByTeamIdAndDateBetween(Long teamId, LocalDate startDate, LocalDate endDate);
}
