import { supabase, supabaseAdmin } from "../lib/supabase";
import {
  sendEmail,
  getContactFormEmailTemplate,
  getContactReplyTemplate,
} from "./email";

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  submitted_at: string;
  status: "new" | "read" | "replied" | "archived";
}

/**
 * Fetches the email of the primary Super Admin.
 * Assumes the first Super Admin in the list is the primary one.
 * Returns undefined if no Super Admin is found or an error occurs.
 */
const getPrimarySuperAdminEmail = async (): Promise<string | undefined> => {
  try {
    const { data, error } = await supabase
      .from("admin_roles")
      .select("email")
      .eq("role", "SUPER_ADMIN")
      .limit(1)
      .single();

    if (error) {
      console.error("Error fetching primary super admin email:", error);
      return undefined;
    }

    return data?.email;
  } catch (error) {
    console.error("Unexpected error fetching primary super admin email:", error);
    return undefined;
  }
};

/**
 * Submit contact form data to Supabase and send email notification
 */
export const submitContactForm = async (
  formData: ContactFormData,
): Promise<boolean> => {
  try {
    // Save contact form submission to Supabase
    const { error } = await supabase.from("contact_submissions").insert([
      {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        submitted_at: new Date().toISOString(),
        status: "new",
      },
    ]);

    if (error) {
      console.error("Error saving contact form to Supabase:", error);
      return false;
    }

    // Store admin notification email in database (email sending is temporarily bypassed)
    try {
      // Fetch all super admin emails
      const { data: adminEmails, error: adminError } = await supabase
        .from("admin_roles")
        .select("email")
        .eq("role", "SUPER_ADMIN");

      if (adminError) {
        console.error("Error fetching super admin emails:", adminError);
        return false; // Or handle this error differently, maybe fallback to a default admin email
      }

      if (!adminEmails || adminEmails.length === 0) {
        console.warn("No super admin emails found.");
        return true; // Form saved, but no admin to notify
      }

      // Get the template for the email
      const emailHtml = getContactFormEmailTemplate(
        formData.name,
        formData.email,
        formData.subject,
        formData.message,
      );

      // Send email to all super admins
      for (const admin of adminEmails) {
        const emailResult = await sendEmail({
          to: admin.email,
          subject: `New Contact Form: ${formData.subject}`,
          html: emailHtml,
          from: "noreply@gsdc.com",
        });

        if (emailResult) {
          console.log(`Admin notification email sent to ${admin.email}`);
        } else {
          console.warn(`Failed to send admin notification email to ${admin.email}`);
        }
      }
    } catch (emailError) {
      console.warn(
        "Email sending failed, but form was saved:",
        emailError,
      );
    }

    // Return true if the form was saved successfully, regardless of email status
    return true;
  } catch (error) {
    console.error("Error submitting contact form:", error);
    return false;
  }
};

/**
 * Get all contact form submissions
 */
export const getContactSubmissions = async (): Promise<ContactSubmission[]> => {
  try {
    const { data, error } = await supabase
      .from("contact_submissions")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (error) {
      console.error("Error fetching contact submissions:", error);
      return [];
    }

    return data as ContactSubmission[];
  } catch (error) {
    console.error("Error fetching contact submissions:", error);
    return [];
  }
};

/**
 * Get a single contact submission by ID
 */
export const getContactSubmission = async (
  id: string,
): Promise<ContactSubmission | null> => {
  try {
    const { data, error } = await supabase
      .from("contact_submissions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching contact submission:", error);
      return null;
    }

    return data as ContactSubmission;
  } catch (error) {
    console.error("Error fetching contact submission:", error);
    return null;
  }
};

/**
 * Update contact submission status
 */
export const updateContactStatus = async (
  id: string,
  status: "new" | "read" | "replied" | "archived",
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("contact_submissions")
      .update({ status })
      .eq("id", id);

    if (error) {
      console.error("Error updating contact status:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error updating contact status:", error);
    return false;
  }
};

/**
 * Delete a contact submission
 */
export const deleteContactSubmission = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("contact_submissions")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting contact submission:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting contact submission:", error);
    return false;
  }
};

/**
 * Send a reply to a contact submission
 */
export const sendContactReply = async (
  submissionId: string,
  replyMessage: string,
  adminEmail?: string
): Promise<boolean> => {
  try {
    // Use provided admin email or get primary Super Admin email
    const fromEmail = adminEmail || await getPrimarySuperAdminEmail();
    console.log('Sending contact reply...', { submissionId, replyMessage, fromEmail });

    // Get the original submission
    const { data: submission, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .eq('id', submissionId)
      .single();

    if (error || !submission) {
      console.error('Error fetching submission:', error);
      return false;
    }

    console.log('Found submission:', submission);

    // Send reply email using the email service
    const emailHtml = getContactReplyTemplate(
      submission.name,
      submission.subject,
      replyMessage
    );

    console.log('Sending email reply...');
    const emailResult = await sendEmail({
      to: submission.email,
      subject: `Re: ${submission.subject}`,
      html: emailHtml,
      from: fromEmail
    });

    console.log('Email result:', emailResult);

    if (emailResult) {
      // Log the reply in contact_replies table
      const { error: replyError } = await supabase
        .from('contact_replies')
        .insert([{
          submission_id: submissionId,
          reply_text: replyMessage,
          admin_email: fromEmail,
          sent_at: new Date().toISOString()
        }]);

      if (replyError) {
        console.error('Error logging reply:', replyError);
        // Don't return false here as email was sent successfully
      }

      return true;
    }

    return false;
  } catch (error) {
    console.error('Error sending contact reply:', error);
    return false;
  }
};

/**
 * Send a user reply to a contact submission
 */
export const sendUserReply = async (
  submissionId: string,
  replyText: string,
  userEmail: string,
): Promise<boolean> => {
  try {
    console.log("Starting sendUserReply for submission:", submissionId);

    // Verify the user owns this submission
    const { data: submission, error: fetchError } = await supabase
      .from("contact_submissions")
      .select("id, email")
      .eq("id", submissionId)
      .eq("email", userEmail)
      .single();

    if (fetchError || !submission) {
      console.error("Error verifying submission ownership:", fetchError);
      return false;
    }

    console.log("Verified submission ownership:", submission);

    // Save the user reply to database using admin client
    try {
      console.log("Attempting to save user reply to database...");

      const replyData = {
        submission_id: submissionId,
        reply_text: replyText,
        user_email: userEmail,
        sent_at: new Date().toISOString(),
      };

      console.log("User reply data:", replyData);

      const { data: insertedReply, error: replyError } = await supabaseAdmin
        .from("user_replies")
        .insert([replyData])
        .select()
        .single();

      if (replyError) {
        console.error("Error saving user reply:", replyError);
        console.error("Error details:", JSON.stringify(replyError, null, 2));
        return false;
      }

      console.log("User reply saved successfully:", insertedReply);
      return true;
    } catch (dbError) {
      console.error("Database insert failed for user reply:", dbError);
      return false;
    }
  } catch (error) {
    console.error("Error sending user reply:", error);
    return false;
  }
};