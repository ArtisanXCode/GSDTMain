
/*
  # Create pause_actions table for tracking contract pause/unpause operations
  
  1. New table
    - `pause_actions` table with fields for tracking pause/unpause actions
    - Includes admin info, reasons, transaction hashes, and timestamps
    
  2. Security
    - Enable RLS on the table
    - Add policies for authenticated users to manage pause actions
*/

-- Create pause_actions table
CREATE TABLE IF NOT EXISTS pause_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action_type TEXT NOT NULL CHECK (action_type IN ('PAUSE', 'UNPAUSE')),
  reason TEXT NOT NULL,
  admin_address TEXT,
  admin_name TEXT,
  transaction_hash TEXT,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE pause_actions ENABLE ROW LEVEL SECURITY;

-- Create policies for pause_actions
CREATE POLICY "pause_actions_select" ON pause_actions
    FOR SELECT 
    TO authenticated
    USING (true);

CREATE POLICY "pause_actions_insert" ON pause_actions
    FOR INSERT 
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "pause_actions_update" ON pause_actions
    FOR UPDATE 
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "pause_actions_delete" ON pause_actions
    FOR DELETE 
    TO authenticated
    USING (true);

-- Allow service role complete access
CREATE POLICY "pause_actions_service_role" ON pause_actions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Grant permissions
GRANT ALL ON pause_actions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON pause_actions TO authenticated;
GRANT SELECT ON pause_actions TO anon;

-- Create updated_at trigger
CREATE TRIGGER update_pause_actions_updated_at
    BEFORE UPDATE ON pause_actions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_pause_actions_created_at ON pause_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pause_actions_is_active ON pause_actions(is_active);
