-- Add invitation status columns to team_members table
ALTER TABLE team_members 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ACCEPTED',
ADD COLUMN IF NOT EXISTS invited_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS responded_at TIMESTAMP;

-- Update existing members to ACCEPTED status
UPDATE team_members SET status = 'ACCEPTED' WHERE status IS NULL OR status = '';

-- Set invited_at for existing members to their creation time (if available)
-- This is optional, just for data consistency
UPDATE team_members SET invited_at = CURRENT_TIMESTAMP WHERE invited_at IS NULL;
UPDATE team_members SET responded_at = CURRENT_TIMESTAMP WHERE responded_at IS NULL AND status = 'ACCEPTED';
