
import { supabase } from '../lib/supabase';
import { sendEmail } from './email';

export interface UserMessage {
  id: string;
  user_id: string;
  message: string;
  sender: 'user' | 'admin';
  admin_reply?: string;
  replied_by?: string;
  replied_at?: string;
  created_at: string;
  read_by_user: boolean;
  read_by_admin: boolean;
}

export const getUserMessages = async (userId: string): Promise<UserMessage[]> => {
  const { data, error } = await supabase
    .from('user_messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const sendUserMessage = async (
  userId: string, 
  message: string,
  userEmail?: string,
  emailNotificationsEnabled: boolean = true
): Promise<void> => {
  const { error } = await supabase
    .from('user_messages')
    .insert([
      {
        user_id: userId,
        message: message.trim(),
        sender: 'user',
        read_by_admin: false,
        read_by_user: true,
        created_at: new Date().toISOString()
      }
    ]);

  if (error) throw error;

  // Send confirmation email if enabled
  if (emailNotificationsEnabled && userEmail) {
    try {
      await sendMessageConfirmationEmail(userEmail, message);
    } catch (emailError) {
      console.warn('Failed to send confirmation email:', emailError);
    }
  }
};

export const replyToUserMessage = async (
  messageId: string,
  reply: string,
  adminId: string,
  adminName: string,
  userEmail: string
): Promise<void> => {
  // Update the message with admin reply
  const { error: updateError } = await supabase
    .from('user_messages')
    .update({
      admin_reply: reply,
      replied_by: adminName,
      replied_at: new Date().toISOString(),
      read_by_user: false
    })
    .eq('id', messageId);

  if (updateError) throw updateError;

  // Get the original message for email context
  const { data: messageData, error: fetchError } = await supabase
    .from('user_messages')
    .select('message, created_at')
    .eq('id', messageId)
    .single();

  if (fetchError) throw fetchError;

  // Send notification email to user
  try {
    await sendAdminReplyNotificationEmail(
      userEmail,
      messageData.message,
      reply,
      adminName
    );
  } catch (emailError) {
    console.warn('Failed to send reply notification email:', emailError);
  }
};

export const markMessageAsRead = async (
  messageId: string,
  readBy: 'user' | 'admin'
): Promise<void> => {
  const updateField = readBy === 'user' ? 'read_by_user' : 'read_by_admin';
  
  const { error } = await supabase
    .from('user_messages')
    .update({ [updateField]: true })
    .eq('id', messageId);

  if (error) throw error;
};

const sendMessageConfirmationEmail = async (userEmail: string, message: string) => {
  const template = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Message Sent - GSDC</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
        .container { padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
        .header { background-color: #2a4661; color: white; padding: 15px 20px; border-radius: 5px 5px 0 0; margin: -20px -20px 20px -20px; }
        .content { padding: 20px 0; }
        .message-preview { background-color: #f9f9f9; padding: 15px; border-left: 4px solid #2a4661; margin: 15px 0; }
        .footer { margin-top: 20px; font-size: 12px; color: #666; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
        .cta-button { display: inline-block; background-color: #2a4661; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1 class="header">Message Sent Successfully</h1>
        <div class="content">
          <p>Your message has been successfully sent to our support team.</p>
          
          <h3>Your Message:</h3>
          <div class="message-preview">${message}</div>
          
          <p>Our support team will review your message and respond as soon as possible. You will receive an email notification when we reply.</p>
          
          <p>You can also check your messages anytime in your account dashboard.</p>
          
          <a href="${process.env.NODE_ENV === 'production' ? 'https://gsdc.replit.app' : 'http://localhost:3000'}/my-account" class="cta-button">View My Account</a>
        </div>
        <div class="footer">
          <p>This is an automated confirmation from GSDC Support.</p>
          <p>© ${new Date().getFullYear()} Global South Digital Token. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: userEmail,
    subject: 'Message Sent Successfully - GSDC Support',
    html: template,
    from: 'support@gsdc.com'
  });
};

const sendAdminReplyNotificationEmail = async (
  userEmail: string,
  originalMessage: string,
  reply: string,
  adminName: string
) => {
  const template = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Reply from GSDC Support</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
        .container { padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
        .header { background-color: #2a4661; color: white; padding: 15px 20px; border-radius: 5px 5px 0 0; margin: -20px -20px 20px -20px; }
        .content { padding: 20px 0; }
        .original-message { background-color: #f0f0f0; padding: 15px; border-left: 4px solid #ccc; margin: 15px 0; }
        .reply-message { background-color: #e8f5e8; padding: 15px; border-left: 4px solid #28a745; margin: 15px 0; }
        .footer { margin-top: 20px; font-size: 12px; color: #666; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
        .cta-button { display: inline-block; background-color: #2a4661; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1 class="header">New Reply from GSDC Support</h1>
        <div class="content">
          <p>You have received a new reply from our support team regarding your message:</p>
          
          <h3>Your Original Message:</h3>
          <div class="original-message">${originalMessage}</div>
          
          <h3>Our Reply:</h3>
          <div class="reply-message">${reply}</div>
          
          <p><strong>Replied by:</strong> ${adminName}</p>
          
          <p>You can view all your messages and continue the conversation in your account dashboard.</p>
          
          <a href="${process.env.NODE_ENV === 'production' ? 'https://gsdc.replit.app' : 'http://localhost:3000'}/my-account" class="cta-button">View Messages</a>
        </div>
        <div class="footer">
          <p>This email was sent from GSDC Support Team.</p>
          <p>© ${new Date().getFullYear()} Global South Digital Token. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: userEmail,
    subject: 'New Reply from GSDC Support',
    html: template,
    from: 'support@gsdc.com'
  });
};

export const getUserEmailNotificationSettings = async (userId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('user_settings')
    .select('email_notifications')
    .eq('user_id', userId)
    .single();

  if (error || !data) return true; // Default to enabled
  return data.email_notifications;
};

export const updateEmailNotificationSettings = async (
  userId: string,
  enabled: boolean
): Promise<void> => {
  const { error } = await supabase
    .from('user_settings')
    .upsert([
      {
        user_id: userId,
        email_notifications: enabled,
        updated_at: new Date().toISOString()
      }
    ], { 
      onConflict: 'user_id' 
    });

  if (error) throw error;
};
