
import { supabase } from "../lib/supabase";

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Global function to send emails using the email API server
 */
export const sendEmail = async (emailData: EmailData): Promise<boolean> => {
  try {
    console.log("Attempting to send email:", {
      to: emailData.to,
      subject: emailData.subject,
      from: emailData.from || "noreply@gsdc.com"
    });

    // Save the email to database first
    const { error: dbError } = await supabase.from("emails").insert([
      {
        to_email: emailData.to,
        from_email: emailData.from || "noreply@gsdc.com",
        subject: emailData.subject,
        html: emailData.html,
        sent_at: new Date().toISOString(),
        status: 'pending'
      },
    ]);

    if (dbError) {
      console.error("Error saving email to database:", dbError);
      return false;
    }

    // Try to send via the email API server
    try {
      const emailApiUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:5002/api/send-email'
        : `${window.location.protocol}//${window.location.hostname}:5002/api/send-email`;
        
      const response = await fetch(emailApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (response.ok) {
        console.log("Email sent successfully via API");
        
        // Update database status to 'sent'
        await supabase
          .from("emails")
          .update({ status: 'sent' })
          .eq('to_email', emailData.to)
          .eq('subject', emailData.subject);
        
        return true;
      } else {
        const errorData = await response.json();
        console.error(`API responded with status: ${response.status}`, errorData);
        
        // Update database status to 'failed'
        await supabase
          .from("emails")
          .update({ status: 'failed' })
          .eq('to_email', emailData.to)
          .eq('subject', emailData.subject);
        
        return false;
      }
    } catch (apiError) {
      console.error("API email failed:", apiError);
      
      // Update database status to 'failed'
      await supabase
        .from("emails")
        .update({ status: 'failed' })
        .eq('to_email', emailData.to)
        .eq('subject', emailData.subject);
      
      return false;
    }

    // TODO: Future email integration will go here
    // Uncomment and modify the sections below when ready to implement actual email sending:
    
    /*
    // Try to send via Supabase Edge Function
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: emailData
      });

      if (error) throw error;
      
      console.log("Email sent successfully via Edge Function");
      
      // Update database status to 'sent'
      await supabase
        .from("emails")
        .update({ status: 'sent' })
        .eq('to_email', emailData.to)
        .eq('subject', emailData.subject);
      
      return true;
    } catch (edgeFunctionError) {
      console.warn("Edge Function email failed, trying alternative method:", edgeFunctionError);
      
      // Alternative: Use the email API server on port 5001
      try {
        const emailApiUrl = window.location.hostname === 'localhost' 
          ? 'http://localhost:5001/api/send-email'
          : `${window.location.protocol}//${window.location.hostname}:5001/api/send-email`;
          
        const response = await fetch(emailApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailData),
        });

        if (response.ok) {
          console.log("Email sent successfully via API");
          
          // Update database status to 'sent'
          await supabase
            .from("emails")
            .update({ status: 'sent' })
            .eq('to_email', emailData.to)
            .eq('subject', emailData.subject);
          
          return true;
        } else {
          throw new Error(`API responded with status: ${response.status}`);
        }
      } catch (apiError) {
        console.warn("API email failed:", apiError);
        return false;
      }
    }
    */

  } catch (error) {
    console.error("Error in email service:", error);
    return false;
  }
};

/**
 * Email template for contact form submissions
 */
export const getContactFormEmailTemplate = (
  name: string,
  email: string,
  subject: string,
  message: string,
): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Contact Form Submission</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
        }
        .container {
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 5px;
        }
        .header {
          background-color: #4c1d95;
          color: white;
          padding: 10px 20px;
          border-radius: 5px 5px 0 0;
          margin-top: 0;
        }
        .content {
          padding: 20px;
        }
        .field {
          margin-bottom: 15px;
        }
        .label {
          font-weight: bold;
          margin-bottom: 5px;
        }
        .value {
          padding: 10px;
          background-color: #f9f9f9;
          border-radius: 3px;
        }
        .footer {
          margin-top: 20px;
          font-size: 12px;
          color: #666;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1 class="header">New Contact Form Submission</h1>
        <div class="content">
          <div class="field">
            <div class="label">Name:</div>
            <div class="value">${name}</div>
          </div>
          <div class="field">
            <div class="label">Email:</div>
            <div class="value">${email}</div>
          </div>
          <div class="field">
            <div class="label">Subject:</div>
            <div class="value">${subject}</div>
          </div>
          <div class="field">
            <div class="label">Message:</div>
            <div class="value">${message}</div>
          </div>
        </div>
        <div class="footer">
          This email was sent from the GSDC website contact form.
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Email template for replying to contact form submissions
 */
export const getContactReplyTemplate = (
  name: string,
  originalSubject: string,
  replyMessage: string,
): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Response to Your Inquiry</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
        }
        .container {
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 5px;
        }
        .header {
          background-color: #4c1d95;
          color: white;
          padding: 10px 20px;
          border-radius: 5px 5px 0 0;
          margin-top: 0;
        }
        .content {
          padding: 20px;
        }
        .message {
          margin-bottom: 20px;
          line-height: 1.6;
        }
        .footer {
          margin-top: 20px;
          font-size: 12px;
          color: #666;
          text-align: center;
          border-top: 1px solid #eee;
          padding-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1 class="header">Response to Your Inquiry</h1>
        <div class="content">
          <p>Dear ${name},</p>
          <p>Thank you for contacting us regarding "${originalSubject}".</p>
          <div class="message">
            ${replyMessage.replace(/\n/g, "<br>")}
          </div>
          <p>If you have any further questions, please don't hesitate to contact us again.</p>
          <p>Best regards,<br>GSDC Support Team</p>
        </div>
        <div class="footer">
          <p>This email is in response to your inquiry submitted through the GSDC website.</p>
          <p>© ${new Date().getFullYear()} Global South Digital Token. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export interface EmailNotificationData {
  to: string;
  type: 'kyc_approved' | 'kyc_rejected' | 'welcome';
  data: Record<string, any>;
}

export const sendNotificationEmail = async (notification: EmailNotificationData): Promise<boolean> => {
  try {
    // This would integrate with your email service (SendGrid, AWS SES, etc.)
    const response = await fetch('/api/send-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notification),
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending email notification:', error);
    return false;
  }
};

export const sendKYCApprovalEmail = async (email: string, firstName: string): Promise<boolean> => {
  return sendNotificationEmail({
    to: email,
    type: 'kyc_approved',
    data: {
      firstName,
      mintingUrl: `${window.location.origin}/token-minting`,
      dashboardUrl: `${window.location.origin}/dashboard`,
    }
  });
};

export const sendWelcomeEmail = async (email: string, firstName: string): Promise<boolean> => {
  return sendNotificationEmail({
    to: email,
    type: 'welcome',
    data: {
      firstName,
      kycUrl: `${window.location.origin}/dashboard`,
    }
  });
};
