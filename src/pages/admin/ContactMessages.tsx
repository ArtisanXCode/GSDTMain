import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../../hooks/useWallet";
import { useAdmin } from "../../hooks/useAdmin";
import {
  getContactSubmissions,
  updateContactStatus,
  deleteContactSubmission,
  ContactSubmission,
  sendContactReply,
} from "../../services/contact";
import { format } from "date-fns";
import {
  EyeIcon,
  ArchiveBoxIcon,
  ArchiveBoxXMarkIcon,
  TrashIcon,
  PaperAirplaneIcon,
  ChatBubbleLeftEllipsisIcon,
} from "@heroicons/react/24/outline";
import AdminNavigation from "../../components/admin/AdminNavigation";
import AdminHeroSection from "../../components/admin/AdminHeroSection";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";

export default function ContactMessages() {
  const { isConnected } = useWallet();
  const { isSuperAdmin } = useAdmin();
  const navigate = useNavigate();
  const [contactSubmissions, setContactSubmissions] = useState<
    ContactSubmission[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null,
  );
  const [messageSuccess, setMessageSuccess] = useState<string | null>(null);

  // Contact message view/reply state
  const [selectedMessage, setSelectedMessage] =
    useState<ContactSubmission | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [userReplies, setUserReplies] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getContactSubmissions();
        setContactSubmissions(data);
      } catch (err: any) {
        console.error("Error loading contact submissions:", err);
        setError(err.message || "Error loading contact submissions");
      } finally {
        setLoading(false);
      }
    };

    loadSubmissions();
  }, []);

  const handleStatusChange = async (
    id: string,
    status: "new" | "read" | "replied" | "archived",
  ) => {
    if (!isSuperAdmin) {
      setError("Only Super Admins can change message status");
      return;
    }

    try {
      setActionLoading(true);
      const success = await updateContactStatus(id, status);

      if (success) {
        // Update UI optimistically
        setContactSubmissions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status } : s)),
        );

        // If we're viewing this message, update its status in the modal too
        if (selectedMessage && selectedMessage.id === id) {
          setSelectedMessage({
            ...selectedMessage,
            status,
          });
        }

        // setMessageSuccess("Status updated successfully");
        // setTimeout(() => setMessageSuccess(null), 3000);
        if (status === "archived") {
          toast.success('Message archived successfully!', {
            duration: 3000, // Hide after 3 seconds
          });
        } else {
          toast.success('Status updated successfully', {
            duration: 3000, // Hide after 3 seconds
          });
        }
      }
    } catch (err: any) {
      console.error("Error updating status:", err);
      setError(err.message || "Error updating status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!isSuperAdmin) {
      setError("Only Super Admins can delete messages");
      return;
    }

    try {
      setActionLoading(true);
      const success = await deleteContactSubmission(id);

      if (success) {
        // Remove from UI
        setContactSubmissions((prev) => prev.filter((s) => s.id !== id));
        setShowDeleteConfirm(null);

        // If we're viewing this message, close the modal
        if (selectedMessage && selectedMessage.id === id) {
          setShowMessageModal(false);
          setSelectedMessage(null);
        }

        // setMessageSuccess("Message deleted successfully");
        // setTimeout(() => setMessageSuccess(null), 3000);
        toast.success('Message deleted successfully!', {
          duration: 3000, // Hide after 3 seconds
        });
      } else {
        setError("Failed to delete message");
      }
    } catch (err: any) {
      console.error("Error deleting message:", err);
      setError(err.message || "Error deleting message");
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewMessage = async (message: ContactSubmission) => {
    setSelectedMessage(message);
    setShowMessageModal(true);
    setReplyText("");

    // Load both user replies and admin replies for this message
    try {
      const [userRepliesResponse, adminRepliesResponse] = await Promise.all([
        supabase
          .from('user_replies')
          .select('*')
          .eq('submission_id', message.id)
          .order('sent_at', { ascending: true }),
        supabase
          .from('contact_replies')
          .select('*')
          .eq('submission_id', message.id)
          .order('sent_at', { ascending: true })
      ]);

      if (userRepliesResponse.error) {
        console.error('Error loading user replies:', userRepliesResponse.error);
      }

      if (adminRepliesResponse.error) {
        console.error('Error loading admin replies:', adminRepliesResponse.error);
      }

      // Combine and sort all replies by sent_at, adding type to distinguish them
      const allReplies = [
        ...(userRepliesResponse.data || []).map(reply => ({
          ...reply,
          type: 'user_reply' as const
        })),
        ...(adminRepliesResponse.data || []).map(reply => ({
          ...reply,
          type: 'admin_reply' as const
        }))
      ].sort((a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime());

      setUserReplies(allReplies);
    } catch (err) {
      console.error('Error loading replies:', err);
      setUserReplies([]);
    }

    // Scroll to bottom after loading replies
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);

    // If message is new, mark it as read silently without showing success message
    if (message.status === "new") {
      try {
        setActionLoading(true);
        const success = await updateContactStatus(message.id, "read");

        if (success) {
          // Update UI optimistically without showing success message
          setContactSubmissions((prev) =>
            prev.map((s) => (s.id === message.id ? { ...s, status: "read" } : s)),
          );

          // Update the selected message status in the modal
          setSelectedMessage({
            ...message,
            status: "read",
          });
        }
      } catch (err: any) {
        console.error("Error updating status:", err);
        setError(err.message || "Error updating status");
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;

    try {
      setActionLoading(true);
      setError(null); // Clear any previous errors

      // Send reply
      const result = await sendContactReply(selectedMessage.id, replyText.trim(), "admin@gsdc.com");

      if (result) {
        // Update status to replied
        await updateContactStatus(selectedMessage.id, "replied");

        setSelectedMessage({
          ...selectedMessage,
          status: "replied",
        });

        // setMessageSuccess("Reply sent successfully!");
        // setReplyText("");
        toast.success('Reply sent successfully!', {
          duration: 3000, // Hide after 3 seconds
        });
        setReplyText("");


        // Refresh the replies for this message to show the new admin reply
        try {
          const [userRepliesResponse, adminRepliesResponse] = await Promise.all([
            supabase
              .from('user_replies')
              .select('*')
              .eq('submission_id', selectedMessage.id)
              .order('sent_at', { ascending: true }),
            supabase
              .from('contact_replies')
              .select('*')
              .eq('submission_id', selectedMessage.id)
              .order('sent_at', { ascending: true })
          ]);

          // Combine and sort all replies by sent_at
          const allReplies = [
            ...(userRepliesResponse.data || []).map(reply => ({
              ...reply,
              type: 'user_reply' as const
            })),
            ...(adminRepliesResponse.data || []).map(reply => ({
              ...reply,
              type: 'admin_reply' as const
            }))
          ].sort((a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime());

          setUserReplies(allReplies);

          // Scroll to bottom after refreshing replies
          setTimeout(() => {
            if (messagesEndRef.current) {
              messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
            }
          }, 100);
        } catch (err) {
          console.error('Error refreshing replies:', err);
        }

        // Close modal after short delay
        setTimeout(() => {
          setShowMessageModal(false);
        }, 1500);

        // Refresh the submissions list
        const data = await getContactSubmissions();
        setContactSubmissions(data);
      } else {
        setError("Failed to send reply. Please try again.");
      }
    } catch (err: any) {
      console.error("Error sending reply:", err);
      setError(err.message || "Failed to send reply. Please check your connection and try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "read":
        return "bg-yellow-100 text-yellow-800";
      case "replied":
        return "bg-green-100 text-green-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <div className="bg-white">
        <AdminHeroSection />

        {/* Main content section */}
        <div className="bg-gray-200 py-24 sm:py-32 relative">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            {/* Navigation Menu */}
          <AdminNavigation className="mb-8" />

            {/* Contact Messages Section */}
            <div
              className="rounded-lg p-6"
              style={{ backgroundColor: "#5a7a96" }}
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-3xl font-semibold text-white mb-1">
                    Contact Messages
                  </h3>
                  <p className="text-sm text-white">
                    View and respond to messages from users
                  </p>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 rounded-lg text-white font-medium"
                  style={{ backgroundColor: "#ed9030" }}
                >
                  Refresh
                </button>
              </div>

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg word-break">
                  {error}
                </div>
              )}

              {messageSuccess && (
                <div className="mt-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
                  {messageSuccess}
                </div>
              )}

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-4 text-gray-500">
                    Loading contact submissions...
                  </p>
                </div>
              ) : contactSubmissions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No contact submissions found</p>
                </div>
              ) : (
                <div className="mt-8 overflow-x-auto">
                  <table className="min-w-full divide-y divide-white/20">
                    <thead style={{ backgroundColor: "#1e3a5f" }}>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                          Subject
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                          Submitted
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-white/80 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      className="divide-y divide-white/20"
                      style={{ backgroundColor: "#2a4661" }}
                    >
                      {contactSubmissions.map((submission) => (
                        <motion.tr
                          key={submission.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-white/5"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            {submission.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            {submission.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            {submission.subject}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(submission.status)}`}
                            >
                              {submission.status.charAt(0).toUpperCase() +
                                submission.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                            {format(
                              new Date(submission.submitted_at),
                              "MMM d, yyyy HH:mm",
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex justify-center space-x-3">
                              <button
                                onClick={() => handleViewMessage(submission)}
                                className="text-blue-400 hover:text-blue-300 flex items-center"
                                title="View Message"
                              >
                                <EyeIcon className="h-5 w-5" />
                              </button>

                              {isSuperAdmin && (
                                <>
                                  {submission.status === "archived" ? (
                                    <button
                                      onClick={() =>
                                        handleStatusChange(
                                          submission.id,
                                          "read",
                                        )
                                      }
                                      disabled={actionLoading}
                                      className="text-green-400 hover:text-green-300 disabled:opacity-50 flex items-center"
                                      title="Unarchive Message"
                                    >
                                      <ArchiveBoxXMarkIcon className="h-5 w-5" />
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() =>
                                        handleStatusChange(
                                          submission.id,
                                          "archived",
                                        )
                                      }
                                      disabled={actionLoading}
                                      className="text-gray-400 hover:text-gray-300 disabled:opacity-50 flex items-center"
                                      title="Archive Message"
                                    >
                                      <ArchiveBoxIcon className="h-5 w-5" />
                                    </button>
                                  )}

                                  <button
                                    onClick={() =>
                                      setShowDeleteConfirm(submission.id)
                                    }
                                    disabled={actionLoading}
                                    className="text-red-400 hover:text-red-300 disabled:opacity-50 flex items-center"
                                    title="Delete Message"
                                  >
                                    <TrashIcon className="h-5 w-5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* View/Reply Message Modal */}
      {showMessageModal && selectedMessage && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col"
          >
            {/* Modal Header - Fixed */}
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedMessage.subject}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    From: {selectedMessage.name} &lt;{selectedMessage.email}&gt;
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Received:{" "}
                    {format(
                      new Date(selectedMessage.submitted_at),
                      "MMMM d, yyyy HH:mm:ss",
                    )}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(selectedMessage.status)}`}
                  >
                    {selectedMessage.status.charAt(0).toUpperCase() +
                      selectedMessage.status.slice(1)}
                  </span>
                  <button
                    onClick={() => setShowMessageModal(false)}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 rounded-md p-1"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable Conversation Area */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto overscroll-contain p-6 bg-gray-50">
                <h4 className="text-sm font-medium text-gray-500 mb-4">
                  Conversation
                </h4>

                {/* Original Message */}
                <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">
                        {selectedMessage.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{selectedMessage.name}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(selectedMessage.submitted_at), 'MMM d, yyyy at h:mm a')}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>

                {/* All Replies (User and Admin) */}
                {userReplies.map((reply, index) => (
                  <div key={`${reply.type}-${reply.id}`} className={`p-4 rounded-lg border mb-4 ${
                    reply.type === 'admin_reply'
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center mb-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        reply.type === 'admin_reply'
                          ? 'bg-blue-600'
                          : 'bg-green-100'
                      }`}>
                        {reply.type === 'admin_reply' ? (
                          <span className="text-xs font-medium text-white">A</span>
                        ) : (
                          <span className="text-xs font-medium text-green-600">
                            {selectedMessage?.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {reply.type === 'admin_reply' ? 'Admin' : selectedMessage?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {reply.type === 'admin_reply' ? 'Replied' : 'User replied'} on {format(new Date(reply.sent_at), 'MMM d, yyyy at h:mm a')}
                        </p>
                      </div>
                    </div>
                    <p className={`whitespace-pre-wrap ${
                      reply.type === 'admin_reply' ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {reply.reply_text}
                    </p>
                  </div>
                ))}

                {/* Show existing admin reply if any (for compatibility with old data) */}
                {selectedMessage.admin_reply && !userReplies.some(r => r.type === 'admin_reply') && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-white">A</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">Admin</p>
                        <p className="text-xs text-gray-500">
                          Previous reply
                        </p>
                      </div>
                    </div>
                    <p className="text-blue-900 whitespace-pre-wrap">
                      {selectedMessage.admin_reply}
                    </p>
                  </div>
                )}

                {/* Scroll anchor for conversation area */}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Reply Form - Fixed at bottom */}
            <div className="border-t border-gray-200 bg-white p-6 flex-shrink-0">
              {messageSuccess ? (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                  {messageSuccess}
                </div>
              ) : (
                <>
                  {selectedMessage.status !== "archived" && (
                    <>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">
                        Reply
                      </h4>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="block w-full rounded-md border-0 bg-gray-50 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
                        rows={3}
                        placeholder="Type your reply here..."
                      />
                    </>
                  )}

                  {error && (
                    <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                      {error}
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-4">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleDelete(selectedMessage.id)}
                        disabled={actionLoading}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <TrashIcon className="h-5 w-5 mr-2" />
                        Delete
                      </button>

                      {selectedMessage.status === "archived" ? (
                        <button
                          onClick={() => handleStatusChange(selectedMessage.id, "read")}
                          disabled={actionLoading}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <ArchiveBoxXMarkIcon className="h-5 w-5 mr-2" />
                          Unarchive
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(selectedMessage.id, "archived")}
                          disabled={actionLoading}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                          <ArchiveBoxIcon className="h-5 w-5 mr-2" />
                          Archive
                        </button>
                      )}
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => setShowMessageModal(false)}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        Close
                      </button>

                      {selectedMessage.status !== "archived" && (
                        <button
                          onClick={handleSendReply}
                          disabled={actionLoading || !replyText.trim()}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          {actionLoading ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Sending...
                            </>
                          ) : (
                            <>
                              <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                              Send Reply
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <TrashIcon className="h-6 w-6 text-red-600 mr-2" />
              Confirm Deletion
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete this message? This action cannot
              be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  showDeleteConfirm && handleDelete(showDeleteConfirm)
                }
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 flex items-center"
              >
                {actionLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Delete Message
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}