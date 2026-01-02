-- ============================================================================
-- StandUpStrip Database Schema
-- ============================================================================
-- This schema defines all tables for the StandUpStrip application
-- Compatible with PostgreSQL (production) and H2 (development)
-- ============================================================================

-- Drop tables if they exist (for clean reinstall)
DROP TABLE IF EXISTS standup_summaries CASCADE;
DROP TABLE IF EXISTS standups CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================================
-- Users Table
-- Stores user authentication and profile information
-- ============================================================================
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for users table
CREATE INDEX idx_users_email ON users(email);

-- ============================================================================
-- Teams Table
-- Stores team information with soft delete support
-- ============================================================================
CREATE TABLE teams (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner_user_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP,
    CONSTRAINT fk_teams_owner FOREIGN KEY (owner_user_id) 
        REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for teams table
CREATE INDEX idx_teams_owner ON teams(owner_user_id);
CREATE INDEX idx_teams_deleted ON teams(deleted);

-- ============================================================================
-- Team Members Table
-- Junction table for many-to-many relationship between teams and users
-- ============================================================================
CREATE TABLE team_members (
    id BIGSERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'MEMBER',
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_team_members_team FOREIGN KEY (team_id) 
        REFERENCES teams(id) ON DELETE CASCADE,
    CONSTRAINT fk_team_members_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_team_user UNIQUE (team_id, user_id)
);

-- Indexes for team_members table
CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);

-- ============================================================================
-- Standups Table
-- Stores daily standup submissions from team members
-- ============================================================================
CREATE TABLE standups (
    id BIGSERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    date DATE NOT NULL,
    yesterday_text TEXT,
    today_text TEXT,
    blockers_text TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_standups_team FOREIGN KEY (team_id) 
        REFERENCES teams(id) ON DELETE CASCADE,
    CONSTRAINT fk_standups_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_standup_team_user_date UNIQUE (team_id, user_id, date)
);

-- Indexes for standups table
CREATE INDEX idx_standups_team_date ON standups(team_id, date);
CREATE INDEX idx_standups_user ON standups(user_id);
CREATE INDEX idx_standups_date ON standups(date);

-- ============================================================================
-- Standup Summaries Table
-- Stores AI-generated summaries for team standups
-- ============================================================================
CREATE TABLE standup_summaries (
    id BIGSERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL,
    date DATE NOT NULL,
    summary_text TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    generated_by_ai BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_summaries_team FOREIGN KEY (team_id) 
        REFERENCES teams(id) ON DELETE CASCADE,
    CONSTRAINT uk_summary_team_date UNIQUE (team_id, date)
);

-- Indexes for standup_summaries table
CREATE INDEX idx_summaries_team_date ON standup_summaries(team_id, date);
CREATE INDEX idx_summaries_date ON standup_summaries(date);

-- ============================================================================
-- Comments and Documentation
-- ============================================================================

COMMENT ON TABLE users IS 'Stores user authentication and profile information';
COMMENT ON TABLE teams IS 'Stores team information with soft delete support';
COMMENT ON TABLE team_members IS 'Junction table linking users to teams with roles';
COMMENT ON TABLE standups IS 'Daily standup submissions from team members';
COMMENT ON TABLE standup_summaries IS 'AI-generated summaries of team standups';

COMMENT ON COLUMN teams.deleted IS 'Soft delete flag - true means team is deleted';
COMMENT ON COLUMN standup_summaries.generated_by_ai IS 'Indicates if summary was AI-generated';
COMMENT ON COLUMN team_members.role IS 'User role in team (OWNER, ADMIN, MEMBER)';
