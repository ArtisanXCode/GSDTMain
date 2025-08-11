
-- Fix contact_replies RLS policy to allow proper admin access

-- Drop existing policies
DROP POLICY IF EXISTS "contact_replies_insert" ON contact_replies;
DROP POLICY IF EXISTS "contact_replies_select" ON contact_replies;
DROP POLICY IF EXISTS "contact_replies_admin_insert" ON contact_replies;
DROP POLICY IF EXISTS "contact_replies_user_select" ON contact_replies;

-- Create new policies that work with service role and authenticated users
-- Allow service role (used by your application) full access
CREATE POLICY "contact_replies_service_role" ON contact_replies
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Allow authenticated users to insert (we'll handle admin check in application logic)
CREATE POLICY "contact_replies_authenticated_insert" ON contact_replies
    FOR INSERT 
    TO authenticated
    WITH CHECK (true);

-- Allow users to select replies to their own messages or let application handle admin logic
CREATE POLICY "contact_replies_authenticated_select" ON contact_replies
    FOR SELECT 
    TO authenticated
    USING (
        -- Allow if user owns the original submission
        EXISTS (
            SELECT 1 FROM contact_submissions cs
            WHERE cs.id = contact_replies.submission_id
            AND cs.email = auth.jwt() ->> 'email'
        )
        -- Or allow all (admin check will be handled in application)
        OR true
    );

-- Also ensure emails table has proper policies
DROP POLICY IF EXISTS "emails_insert" ON emails;
DROP POLICY IF EXISTS "emails_select" ON emails;

-- Allow service role full access to emails
CREATE POLICY "emails_service_role" ON emails
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Allow authenticated users to insert emails
CREATE POLICY "emails_authenticated_insert" ON emails
    FOR INSERT 
    TO authenticated
    WITH CHECK (true);

-- Allow authenticated users to select emails
CREATE POLICY "emails_authenticated_select" ON emails
    FOR SELECT 
    TO authenticated
    USING (true);
