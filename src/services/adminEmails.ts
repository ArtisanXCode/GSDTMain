
import { supabase } from '../lib/supabase';
import { SMART_CONTRACT_ROLES } from '../constants/roles';

export interface SuperAdmin {
  user_address: string;
  email: string | null;
  name: string | null;
}

/**
 * Get all Super Admin users with email addresses
 */
export const getSuperAdminEmails = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('admin_roles')
      .select('email, name, user_address')
      .eq('role', SMART_CONTRACT_ROLES.SUPER_ADMIN)
      .not('email', 'is', null) // Only get admins with email addresses
      .order('created_at', { ascending: true }); // First created admin will be first

    if (error) {
      console.error('Error fetching super admin emails:', error);
      // Fallback to hardcoded email if database query fails
      return ['laljij@etherauthority.io'];
    }

    if (!data || data.length === 0) {
      console.warn('No super admins with email addresses found, using fallback');
      return ['laljij@etherauthority.io'];
    }

    // Extract email addresses
    const emails = data
      .filter(admin => admin.email && admin.email.trim() !== '')
      .map(admin => admin.email as string);

    return emails.length > 0 ? emails : ['laljij@etherauthority.io'];
  } catch (error) {
    console.error('Error in getSuperAdminEmails:', error);
    // Fallback to hardcoded email
    return ['laljij@etherauthority.io'];
  }
};

/**
 * Get the first Super Admin email (primary admin)
 */
export const getPrimarySuperAdminEmail = async (): Promise<string> => {
  try {
    const emails = await getSuperAdminEmails();
    return emails[0] || 'laljij@etherauthority.io';
  } catch (error) {
    console.error('Error getting primary super admin email:', error);
    return 'laljij@etherauthority.io';
  }
};

/**
 * Get Super Admin details for contact purposes
 */
export const getSuperAdminDetails = async (): Promise<SuperAdmin[]> => {
  try {
    const { data, error } = await supabase
      .from('admin_roles')
      .select('user_address, email, name')
      .eq('role', SMART_CONTRACT_ROLES.SUPER_ADMIN)
      .not('email', 'is', null)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching super admin details:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getSuperAdminDetails:', error);
    return [];
  }
};

/**
 * Send email to all Super Admins or just the primary one
 */
export const getAdminEmailTargets = async (sendToAll: boolean = false): Promise<string[]> => {
  try {
    const emails = await getSuperAdminEmails();
    
    if (sendToAll) {
      return emails;
    } else {
      // Return only the first/primary admin email
      return [emails[0]];
    }
  } catch (error) {
    console.error('Error getting admin email targets:', error);
    return ['laljij@etherauthority.io'];
  }
};
