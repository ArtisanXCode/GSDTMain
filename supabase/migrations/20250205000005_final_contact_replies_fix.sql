
-- Final fix for contact_replies and emails RLS policies
-- This migration will completely reset and fix the policies

-- Disable RLS temporarily to clean up
ALTER TABLE contact_replies DISABLE ROW LEVEL SECURITY;
ALTER TABLE emails DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies for contact_replies
DO $$ 
DECLARE
    pol_name TEXT;
BEGIN
    FOR pol_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'contact_replies' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON contact_replies', pol_name);
    END LOOP;
END $$;

-- Drop ALL existing policies for emails
DO $$ 
DECLARE
    pol_name TEXT;
BEGIN
    FOR pol_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'emails' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON emails', pol_name);
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE contact_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

-- Create simple, permissive policies for contact_replies
-- Allow service role full access (this is what your application uses)
CREATE POLICY "contact_replies_service_role_access" ON contact_replies
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Allow anon role to insert (for unauthenticated API calls)
CREATE POLICY "contact_replies_anon_insert" ON contact_replies
    FOR INSERT 
    TO anon
    WITH CHECK (true);

-- Allow authenticated users full access
CREATE POLICY "contact_replies_authenticated_access" ON contact_replies
    FOR ALL 
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create simple, permissive policies for emails
-- Allow service role full access
CREATE POLICY "emails_service_role_access" ON emails
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Allow anon role to insert
CREATE POLICY "emails_anon_insert" ON emails
    FOR INSERT 
    TO anon
    WITH CHECK (true);

-- Allow authenticated users full access
CREATE POLICY "emails_authenticated_access" ON emails
    FOR ALL 
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON contact_replies TO service_role;
GRANT ALL ON emails TO service_role;
GRANT INSERT ON contact_replies TO anon;
GRANT INSERT ON emails TO anon;
GRANT ALL ON contact_replies TO authenticated;
GRANT ALL ON emails TO authenticated;
