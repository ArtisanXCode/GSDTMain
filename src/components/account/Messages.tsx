import { useState, useEffect } from 'react';
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

export default function Messages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Added error state
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

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
      } catch (err: any) {
        setError(err.message);
        toast.error('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [user?.email]);


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
                  onClick={() => setSelectedMessage(message)}
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