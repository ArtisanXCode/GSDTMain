import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { ChatBubbleLeftIcon, ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { sendEmail } from '../../services/email';
import { toast as toastify } from 'react-toastify';
import {
  getUserMessages,
  sendUserMessage,
  markMessageAsRead,
  getUserEmailNotificationSettings,
  updateEmailNotificationSettings
} from '../../services/messaging';

interface Message {
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

interface UserReply {
  id: string;
  submission_id: string;
  reply_text: string;
  sent_at: string;
  user_email: string;
  type?: 'user_reply' | 'admin_reply'; // Added to distinguish reply types
}

export default function Messages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [userReplies, setUserReplies] = useState<UserReply[]>([]);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    if (user?.id) {
      loadMessages();
      loadUserSettings();
    }
  }, [user?.id]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const messagesData = await getUserMessages(user?.id);
      setMessages(messagesData);

      // Mark unread messages as read
      const unreadMessages = messagesData.filter(msg => !msg.read_by_user && msg.admin_reply);
      for (const msg of unreadMessages) {
        await markMessageAsRead(msg.id, 'user');
      }
    } catch (error: any) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const loadUserSettings = async () => {
    try {
      const notificationSetting = await getUserEmailNotificationSettings(user?.id);
      setEmailNotifications(notificationSetting);
      setUserEmail(user?.email || '');
    } catch (error: any) {
      console.error('Error loading user settings:', error);
    }
  };

  // Scroll to bottom when userReplies updates - only scroll within the container
  useEffect(() => {
    if (messagesEndRef.current && selectedMessage) {
      // Find the scrollable container
      const scrollContainer = messagesEndRef.current.closest('.overflow-y-auto');
      if (scrollContainer) {
        // Scroll within the container only
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [userReplies, selectedMessage]);


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-yellow-100 text-yellow-800';
      case 'read':
        return 'bg-blue-100 text-blue-800';
      case 'replied':
        return 'bg-green-100 text-green-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new':
        return 'New';
      case 'read':
        return 'Read';
      case 'replied':
        return 'Replied';
      case 'archived':
        return 'Archived';
      default:
        return 'Unknown';
    }
  };

  const handleMessageSelect = async (message: Message) => {
    setSelectedMessage(message);
    setReplyText(''); // Clear reply text when selecting a new message

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
    } catch (err) {
      console.error('Error loading replies:', err);
      setUserReplies([]);
    }
  };


  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim() || !user?.email) return;

    try {
      setSendingReply(true);
      setError(null);

      // Save user reply to database
      const { data: replyData, error: replyError } = await supabase
        .from('user_replies')
        .insert([{
          submission_id: selectedMessage.id,
          reply_text: replyText.trim(),
          sent_at: new Date().toISOString(),
          user_email: user.email
        }])
        .select()
        .single();

      if (replyError) throw replyError;

      // Add the new reply to local state with the correct type
      setUserReplies(prev => [...prev, { ...replyData, type: 'user_reply' }]);

      // Clear reply text
      setReplyText('');

      // Show success message with auto-hide
      toast.success('Reply sent successfully!', {
        duration: 3000, // Hide after 3 seconds
      });

      // Optionally update message status to indicate user has replied
      const { error: updateError } = await supabase
        .from('contact_submissions')
        .update({ status: 'replied' })
        .eq('id', selectedMessage.id);

      if (updateError) {
        console.error('Error updating message status:', updateError);
      }

    } catch (err: any) {
      console.error('Error sending reply:', err);
      setError('Failed to send reply. Please try again.');
      toast.error('Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  const toggleEmailNotifications = async () => {
    try {
      const newValue = !emailNotifications;
      await updateEmailNotificationSettings(user?.id, newValue);
      setEmailNotifications(newValue);
      toastify.success(`Email notifications ${newValue ? 'enabled' : 'disabled'}`);
    } catch (error: any) {
      console.error('Error updating email notifications:', error);
      toastify.error('Failed to update notification settings');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user?.id) return;

    try {
      setSending(true);
      await sendUserMessage(
        user.id,
        newMessage.trim(),
        userEmail,
        emailNotifications
      );

      setNewMessage('');
      await loadMessages(); // Reload messages
      toastify.success('Message sent successfully');
    } catch (error: any) {
      console.error('Error sending message:', error);
      toastify.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        Error loading messages: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <ChatBubbleLeftRightIcon className="h-6 w-6 text-gray-500" />
            <span className="text-sm text-gray-600">{messages.length} messages</span>
          </div>
        </div>
      </div>

      {/* Email Notification Settings */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <EnvelopeIcon className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">Email Notifications</h3>
              <p className="text-xs text-blue-700">Get notified via email when you send messages</p>
            </div>
          </div>
          <button
            onClick={toggleEmailNotifications}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
              emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                emailNotifications ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <ChatBubbleLeftIcon className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No messages</h3>
          <p className="text-gray-500 mb-4">You haven't sent any messages to our support team yet</p>
          <a
            href="/contact"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Contact Support
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Your Messages</h3>
            <div className="space-y-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => handleMessageSelect(message)}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedMessage?.id === message.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {message.subject || message.message.substring(0, 30)}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(message.submitted_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(message.status)}`}>
                      {getStatusText(message.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {message.message}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {selectedMessage.subject || selectedMessage.message.substring(0, 50)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Sent on {format(new Date(selectedMessage.submitted_at), 'MMMM d, yyyy at h:mm a')}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(selectedMessage.status)}`}>
                      {getStatusText(selectedMessage.status)}
                    </span>
                  </div>
                </div>

                {/* All Messages - Single Scrollable Container */}
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="max-h-[600px] overflow-y-auto overscroll-contain scroll-smooth">
                      <div className="space-y-4 p-4">
                        {/* Original Message */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-blue-600">
                                {user?.email?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">You</p>
                              <p className="text-xs text-gray-500">
                                {format(new Date(selectedMessage.submitted_at), 'MMM d, yyyy at h:mm a')}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {selectedMessage.message}
                          </p>
                        </div>

                        {/* Admin Reply (if exists and not in userReplies) */}
                        {selectedMessage.admin_reply && !userReplies.some(r => r.type === 'admin_reply') && (
                          <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
                            <div className="flex items-center mb-2">
                              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                <ChatBubbleLeftEllipsisIcon className="w-4 h-4 text-white" />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">Support Team</p>
                                <p className="text-xs text-gray-500">
                                  Replied on {selectedMessage.admin_reply_date ? format(new Date(selectedMessage.admin_reply_date), 'MMM d, yyyy at h:mm a') : 'an unknown date'}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-blue-900 whitespace-pre-wrap">
                              {selectedMessage.admin_reply}
                            </p>
                          </div>
                        )}

                        {/* All Replies (User and Admin) */}
                        {userReplies.map((reply, index) => (
                          <div key={`${reply.type}-${reply.id}`} className={`rounded-lg p-4 ${
                            reply.type === 'admin_reply' ? 'bg-blue-50 border-l-4 border-blue-400' : 'bg-gray-50'
                          }`}>
                            <div className="flex items-center mb-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                reply.type === 'admin_reply'
                                  ? 'bg-blue-600'
                                  : 'bg-green-100'
                              }`}>
                                {reply.type === 'admin_reply' ? (
                                  <ChatBubbleLeftEllipsisIcon className="w-4 h-4 text-white" />
                                ) : (
                                  <span className="text-xs font-medium text-green-600">
                                    {selectedMessage?.name?.charAt(0)?.toUpperCase() || 'U'}
                                  </span>
                                )}
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">
                                  {reply.type === 'admin_reply' ? 'Support Team' : selectedMessage?.name || 'You'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {reply.type === 'admin_reply' ? 'Replied' : 'You replied'} on {format(new Date(reply.sent_at), 'MMM d, yyyy at h:mm a')}
                                </p>
                              </div>
                            </div>
                            <p className={`text-sm whitespace-pre-wrap ${
                              reply.type === 'admin_reply' ? 'text-blue-900' : 'text-gray-700'
                            }`}>
                              {reply.type === 'admin_reply' ? reply.reply_text : reply.reply_text}
                            </p>
                          </div>
                        ))}

                        {/* Scroll anchor */}
                        <div ref={messagesEndRef} />
                      </div>
                    </div>
                  </div>

                  {/* Reply Form - Outside scrollable area */}
                  {selectedMessage.admin_reply && selectedMessage.status !== 'archived' && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Send a Reply</h4>

                      {error && (
                        <div className="mb-3 bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-md text-sm">
                          {error}
                        </div>
                      )}

                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="block w-full rounded-md border-0 bg-gray-50 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
                        rows={4}
                        placeholder="Type your reply here..."
                        disabled={sendingReply}
                      />

                      <div className="flex justify-end mt-3">
                        <button
                          onClick={handleSendReply}
                          disabled={sendingReply || !replyText.trim()}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          {sendingReply ? (
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
                            'Send Reply'
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {(selectedMessage.status === 'new' || selectedMessage.status === 'read') && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Your message is pending a response from our support team. We typically respond within 24 hours.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                <ChatBubbleLeftIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Select a message</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Choose a message from the list to view the conversation
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Message Input */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Send a New Message</h4>

        {error && (
          <div className="mb-3 bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-md text-sm">
            {error}
          </div>
        )}

        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="block w-full rounded-md border-0 bg-gray-50 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
          rows={4}
          placeholder="Type your message here..."
          disabled={sending}
        />

        <div className="flex justify-end mt-3">
          <button
            onClick={sendMessage}
            disabled={sending || !newMessage.trim()}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {sending ? (
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
              'Send Message'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}