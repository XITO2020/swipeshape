ALTER TABLE comments
ADD COLUMN status TEXT DEFAULT 'pending' NOT NULL;

-- Add a check constraint to ensure status can only be one of the allowed values
ALTER TABLE comments
ADD CONSTRAINT check_comment_status CHECK (status IN ('pending', 'approved', 'rejected'));
