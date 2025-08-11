
-- Fix RLS policies for contact_replies and emails tables

-- Drop existing policies for contact_replies
DROP POLICY IF EXISTS "contact_replies_admin_insert" ON contact_replies;
DROP POLICY IF EXISTS "contact_replies_user_select" ON contact_replies;

-- Drop existing policies for emails (if any)
DROP POLICY IF EXISTS "emails_insert_policy" ON emails;
DROP POLICY IF EXISTS "emails_select_policy" ON emails;

-- Create new policies for contact_replies
-- Allow authenticated users to insert (we'll handle authorization in application logic)
CREATE POLICY "contact_replies_insert" ON contact_replies
    FOR INSERT 
    TO authenticated
    WITH CHECK (true);

-- Allow users to select replies to their own messages or admins to see all
CREATE POLICY "contact_replies_select" ON contact_replies
    FOR SELECT 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM contact_submissions cs
            WHERE cs.id = contact_replies.submission_id
            AND cs.email = auth.jwt() ->> 'email'
        ) OR
        EXISTS (
            SELECT 1 FROM admin_roles 
            WHERE user_address = auth.jwt() ->> 'wallet_address'
            AND role IN ('SUPER_ADMIN', 'ADMIN')
        )
    );

-- Enable RLS on emails table if not already enabled
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

-- Create policies for emails table
-- Allow authenticated users to insert emails (for logging purposes)
CREATE POLICY "emails_insert" ON emails
    FOR INSERT 
    TO authenticated
    WITH CHECK (true);

-- Allow authenticated users to select their own emails or admins to see all
CREATE POLICY "emails_select" ON emails
    FOR SELECT 
    TO authenticated
    USING (
        to_email = auth.jwt() ->> 'email' OR
        EXISTS (
            SELECT 1 FROM admin_roles 
            WHERE user_address = auth.jwt() ->> 'wallet_address'
            AND role IN ('SUPER_ADMIN', 'ADMIN')
        )
    );

-- Fix user_replies policies as well
DROP POLICY IF EXISTS "user_replies_user_insert" ON user_replies;
DROP POLICY IF EXISTS "user_replies_select" ON user_replies;

-- Allow authenticated users to insert user replies
CREATE POLICY "user_replies_insert" ON user_replies
    FOR INSERT 
    TO authenticated
    WITH CHECK (
        user_email = auth.jwt() ->> 'email' AND
        EXISTS (
            SELECT 1 FROM contact_submissions cs
            WHERE cs.id = user_replies.submission_id
            AND cs.email = auth.jwt() ->> 'email'
        )
    );

-- Allow users to select their own replies or admins to see all
CREATE POLICY "user_replies_select" ON user_replies
    FOR SELECT 
    TO authenticated
    USING (
        user_email = auth.jwt() ->> 'email' OR
        EXISTS (
            SELECT 1 FROM admin_roles 
            WHERE user_address = auth.jwt() ->> 'wallet_address'
            AND role IN ('SUPER_ADMIN', 'ADMIN')
        )
    );
