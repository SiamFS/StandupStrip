package com.siamcode.backend.repository;

import com.siamcode.backend.entity.WeeklySummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface WeeklySummaryRepository extends JpaRepository<WeeklySummary, Long> {

    List<WeeklySummary> findByTeamIdOrderByWeekStartDateDesc(Long teamId);

    Optional<WeeklySummary> findByTeamIdAndWeekStartDate(Long teamId, LocalDate weekStartDate);

    Optional<WeeklySummary> findFirstByTeamIdOrderByWeekStartDateDesc(Long teamId);
}
