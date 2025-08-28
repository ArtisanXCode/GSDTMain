
-- Add messaging features to user_messages table
ALTER TABLE user_messages 
ADD COLUMN IF NOT EXISTS admin_reply TEXT,
ADD COLUMN IF NOT EXISTS replied_by TEXT,
ADD COLUMN IF NOT EXISTS replied_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS read_by_user BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS read_by_admin BOOLEAN DEFAULT false;

-- Ensure user_settings table has email_notifications column
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_messages_user_id ON user_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_messages_read_status ON user_messages(read_by_admin) WHERE read_by_admin = false;
