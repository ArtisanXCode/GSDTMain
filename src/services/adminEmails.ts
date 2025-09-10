
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
    console.log('Fetching super admin emails...');
    
    const { data, error } = await supabase
      .from('admin_roles')
      .select('email, name, user_address')
      .eq('role', SMART_CONTRACT_ROLES.SUPER_ADMIN)
      .order('created_at', { ascending: true }); // First created admin will be first

    console.log('Super admin query result:', { data, error });

    if (error) {
      console.error('Error fetching super admin emails:', error);
      // Fallback to hardcoded email if database query fails
      return ['laljij@etherauthority.io'];
    }

    if (!data || data.length === 0) {
      console.warn('No super admins found in database, using fallback');
      return ['laljij@etherauthority.io'];
    }

    console.log('Found super admins:', data);

    // Extract email addresses, including null check
    const emails = data
      .filter(admin => {
        const hasEmail = admin.email && admin.email.trim() !== '';
        console.log(`Admin ${admin.name || admin.user_address}: email = ${admin.email}, hasEmail = ${hasEmail}`);
        return hasEmail;
      })
      .map(admin => admin.email as string);

    console.log('Valid emails found:', emails);

    if (emails.length === 0) {
      console.warn('No super admins with valid email addresses found, using fallback');
      return ['laljij@etherauthority.io'];
    }

    return emails;
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
