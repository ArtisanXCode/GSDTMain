
import { supabase } from '../lib/supabase';

export interface UserMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  admin_reply?: string;
  admin_id?: string;
  submitted_at: string;
  admin_reply_date?: string | null;
  user_id: string;
  sender: 'user' | 'admin';
  read_by_user?: boolean;
  replied_by?: string;
  replied_at?: string;
}

export interface EmailNotificationSettings {
  email_notifications: boolean;
  transaction_notifications: boolean;
  kyc_notifications: boolean;
  marketing_emails: boolean;
}

// Get user messages (using contact_submissions table)
export async function getUserMessages(userId: string): Promise<UserMessage[]> {
  try {
    // Get user email first
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user?.email) {
      throw new Error('User not authenticated');
    }

    const userEmail = userData.user.email;

    // Get contact submissions for this user
    const { data: submissions, error: submissionsError } = await supabase
      .from('contact_submissions')
      .select(`
        id,
        name,
        email,
        subject,
        message,
        status,
        submitted_at,
        created_at
      `)
      .eq('email', userEmail)
      .order('submitted_at', { ascending: false });

    if (submissionsError) {
      throw submissionsError;
    }

    // Get admin replies for these submissions
    const submissionIds = submissions?.map(s => s.id) || [];
    const { data: adminReplies, error: repliesError } = await supabase
      .from('contact_replies')
      .select('*')
      .in('submission_id', submissionIds)
      .order('sent_at', { ascending: false });

    if (repliesError) {
      throw repliesError;
    }

    // Get user replies for these submissions
    const { data: userReplies, error: userRepliesError } = await supabase
      .from('user_replies')
      .select('*')
      .in('submission_id', submissionIds)
      .order('sent_at', { ascending: false });

    if (userRepliesError) {
      throw userRepliesError;
    }

    // Combine and format the messages
    const messages: UserMessage[] = [];

    // Add original submissions
    submissions?.forEach(submission => {
      messages.push({
        id: submission.id,
        name: submission.name,
        email: submission.email,
        subject: submission.subject,
        message: submission.message,
        status: submission.status as 'new' | 'read' | 'replied' | 'archived',
        submitted_at: submission.submitted_at || submission.created_at,
        user_id: userId,
        sender: 'user',
        read_by_user: true
      });
    });

    // Add admin replies as separate messages
    adminReplies?.forEach(reply => {
      const originalSubmission = submissions?.find(s => s.id === reply.submission_id);
      if (originalSubmission) {
        messages.push({
          id: `admin_${reply.id}`,
          name: 'Admin',
          email: reply.admin_email,
          subject: `Re: ${originalSubmission.subject}`,
          message: reply.reply_text,
          status: 'replied',
          submitted_at: reply.sent_at,
          admin_reply_date: reply.sent_at,
          user_id: userId,
          sender: 'admin',
          read_by_user: false,
          replied_by: reply.admin_email,
          replied_at: reply.sent_at
        });
      }
    });

    // Add user replies as separate messages
    userReplies?.forEach(reply => {
      const originalSubmission = submissions?.find(s => s.id === reply.submission_id);
      if (originalSubmission) {
        messages.push({
          id: `user_reply_${reply.id}`,
          name: originalSubmission.name,
          email: reply.user_email,
          subject: `Re: ${originalSubmission.subject}`,
          message: reply.reply_text,
          status: 'replied',
          submitted_at: reply.sent_at,
          user_id: userId,
          sender: 'user',
          read_by_user: true
        });
      }
    });

    // Sort by date (newest first)
    return messages.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());

  } catch (error) {
    console.error('Error fetching user messages:', error);
    throw error;
  }
}

// Send a new user message (creates a contact submission)
export async function sendUserMessage(
  subject: string,
  message: string,
  name?: string
): Promise<void> {
  try {
    // Get user data
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user?.email) {
      throw new Error('User not authenticated');
    }

    const userEmail = userData.user.email;

    // Get user profile for name if not provided
    let userName = name;
    if (!userName) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('first_name, last_name')
        .eq('user_id', userData.user.id)
        .single();
      
      if (profile) {
        userName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User';
      } else {
        userName = 'User';
      }
    }

    // Create contact submission
    const { error: insertError } = await supabase
      .from('contact_submissions')
      .insert([
        {
          name: userName,
          email: userEmail,
          subject: subject,
          message: message,
          status: 'new'
        }
      ]);

    if (insertError) {
      throw insertError;
    }

  } catch (error) {
    console.error('Error sending user message:', error);
    throw error;
  }
}

// Reply to an existing conversation (adds to user_replies table)
export async function replyToMessage(
  submissionId: string,
  replyMessage: string
): Promise<void> {
  try {
    // Get user data
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user?.email) {
      throw new Error('User not authenticated');
    }

    const userEmail = userData.user.email;

    // Insert user reply
    const { error: insertError } = await supabase
      .from('user_replies')
      .insert([
        {
          submission_id: submissionId,
          reply_text: replyMessage,
          user_email: userEmail
        }
      ]);

    if (insertError) {
      throw insertError;
    }

    // Update the original submission status to 'replied'
    const { error: updateError } = await supabase
      .from('contact_submissions')
      .update({ status: 'replied' })
      .eq('id', submissionId);

    if (updateError) {
      console.error('Error updating submission status:', updateError);
    }

  } catch (error) {
    console.error('Error replying to message:', error);
    throw error;
  }
}

// Mark message as read (update contact submission status)
export async function markMessageAsRead(messageId: string): Promise<void> {
  try {
    // If it's an admin message, we don't need to mark it as read in the database
    // since read status is tracked client-side for admin messages
    if (messageId.startsWith('admin_') || messageId.startsWith('user_reply_')) {
      return;
    }

    // Update contact submission status to 'read'
    const { error } = await supabase
      .from('contact_submissions')
      .update({ status: 'read' })
      .eq('id', messageId);

    if (error) {
      throw error;
    }

  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
}

// Get user email notification settings
export async function getUserEmailNotificationSettings(userId: string): Promise<EmailNotificationSettings> {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('email_notifications, transaction_notifications, kyc_notifications, marketing_emails')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If no settings exist, return defaults
      if (error.code === 'PGRST116') {
        return {
          email_notifications: true,
          transaction_notifications: true,
          kyc_notifications: true,
          marketing_emails: false
        };
      }
      throw error;
    }

    return {
      email_notifications: data.email_notifications ?? true,
      transaction_notifications: data.transaction_notifications ?? true,
      kyc_notifications: data.kyc_notifications ?? true,
      marketing_emails: data.marketing_emails ?? false
    };

  } catch (error) {
    console.error('Error fetching email notification settings:', error);
    throw error;
  }
}

// Update user email notification settings
export async function updateEmailNotificationSettings(
  userId: string,
  settings: Partial<EmailNotificationSettings>
): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_settings')
      .upsert([
        {
          user_id: userId,
          ...settings
        }
      ]);

    if (error) {
      throw error;
    }

  } catch (error) {
    console.error('Error updating email notification settings:', error);
    throw error;
  }
}
