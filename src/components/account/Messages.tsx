import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { ChatBubbleLeftIcon, ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline';

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

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user?.email) return;

      try {
        setLoading(true);

        // Fetch messages with replies
        const { data: messagesData, error: messagesError } = await supabase
          .from('contact_submissions')
          .select(`
            *,
            contact_replies (
              reply_text,
              admin_email,
              sent_at
            )
          `)
          .eq('email', user.email)
          .order('submitted_at', { ascending: false });

        if (messagesError) throw messagesError;

        // Transform data to include admin_reply field for compatibility
        const transformedMessages = (messagesData || []).map(message => ({
          ...message,
          admin_reply: message.contact_replies?.[0]?.reply_text || null,
          admin_reply_date: message.contact_replies?.[0]?.sent_at || null
        }));

        setMessages(transformedMessages);

        // Fetch user replies
        const submissionIds = transformedMessages.map(m => m.id);
        if (submissionIds.length > 0) {
          // The logic for fetching user replies has been updated to fetch both user and admin replies
          // and combine them into a single `userReplies` state.
          // This block is effectively replaced by the `handleMessageSelect` logic.
        }
      } catch (err: any) {
        setError(err.message);
        toast.error('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [user?.email]);

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

      // Show success message
      toast.success('Reply sent successfully!');

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
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
          <p className="text-gray-600">View your communication history with our support team</p>
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
                        {message.subject}
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
                        {selectedMessage.subject}
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

                {/* Original Message */}
                <div className="space-y-4">
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

                  {/* Admin Reply */}
                  {selectedMessage.admin_reply && (
                    <div className="bg-blue-50 rounded-lg p-4">
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
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {selectedMessage.admin_reply}
                      </p>
                    </div>
                  )}

                  {/* All Replies (User and Admin) - Scrollable container */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="max-h-[400px] overflow-y-auto overscroll-contain scroll-smooth">
                      <div className="space-y-4 p-4">
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
    </div>
  );
}