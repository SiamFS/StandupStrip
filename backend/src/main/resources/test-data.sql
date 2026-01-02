-- Sample Test Data for StandUpStrip
-- Run this after schema.sql to populate with test data

-- Insert test users
INSERT INTO users (name, email, password_hash, created_at) VALUES
('John Doe', 'john@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.JqP5zO8fDhUaGZf8s3i2Pk0G9K6YxO', CURRENT_TIMESTAMP), -- password: password123
('Jane Smith', 'jane@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.JqP5zO8fDhUaGZf8s3i2Pk0G9K6YxO', CURRENT_TIMESTAMP), -- password: password123
('Bob Johnson', 'bob@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.JqP5zO8fDhUaGZf8s3i2Pk0G9K6YxO', CURRENT_TIMESTAMP), -- password: password123
('Alice Williams', 'alice@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.JqP5zO8fDhUaGZf8s3i2Pk0G9K6YxO', CURRENT_TIMESTAMP); -- password: password123

-- Insert test teams (assuming user IDs 1-4)
INSERT INTO teams (name, owner_user_id, created_at, deleted) VALUES
('Engineering Team', 1, CURRENT_TIMESTAMP, FALSE),
('Product Team', 2, CURRENT_TIMESTAMP, FALSE),
('Design Team', 3, CURRENT_TIMESTAMP, FALSE);

-- Insert team members (assuming team IDs 1-3)
-- Engineering Team members
INSERT INTO team_members (team_id, user_id, role, joined_at) VALUES
(1, 1, 'OWNER', CURRENT_TIMESTAMP),
(1, 2, 'MEMBER', CURRENT_TIMESTAMP),
(1, 3, 'MEMBER', CURRENT_TIMESTAMP);

-- Product Team members
INSERT INTO team_members (team_id, user_id, role, joined_at) VALUES
(2, 2, 'OWNER', CURRENT_TIMESTAMP),
(2, 1, 'MEMBER', CURRENT_TIMESTAMP),
(2, 4, 'MEMBER', CURRENT_TIMESTAMP);

-- Design Team members
INSERT INTO team_members (team_id, user_id, role, joined_at) VALUES
(3, 3, 'OWNER', CURRENT_TIMESTAMP),
(3, 4, 'MEMBER', CURRENT_TIMESTAMP);

-- Insert sample standups for today
INSERT INTO standups (team_id, user_id, date, yesterday_text, today_text, blockers_text, created_at) VALUES
(1, 1, CURRENT_DATE, 'Implemented user authentication and JWT tokens', 'Working on team management endpoints', 'None', CURRENT_TIMESTAMP),
(1, 2, CURRENT_DATE, 'Fixed bugs in the login flow', 'Implementing standup submission feature', 'Waiting for API documentation', CURRENT_TIMESTAMP),
(1, 3, CURRENT_DATE, 'Designed database schema', 'Creating frontend mockups', 'None', CURRENT_TIMESTAMP);

-- Insert standups for yesterday
INSERT INTO standups (team_id, user_id, date, yesterday_text, today_text, blockers_text, created_at) VALUES
(1, 1, CURRENT_DATE - 1, 'Set up Spring Boot project structure', 'Implementing user authentication', 'None', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(1, 2, CURRENT_DATE - 1, 'Reviewed requirements', 'Starting on login flow', 'Need access to test environment', CURRENT_TIMESTAMP - INTERVAL '1 day');

-- Note: You can generate a summary by calling: POST /api/summaries/teams/1/generate?date=CURRENT_DATE
