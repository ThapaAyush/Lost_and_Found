import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  User,
  Clock,
  ShieldAlert,
  Loader2,
  ExternalLink,
  AlertCircle,
  Building2,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { conversationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ReportAbuseModal from '../components/ReportAbuseModal';
import { formatTimeAgo } from '../utils/formatters';

const ConversationsPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [activeDetails, setActiveDetails] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [abuseModalOpen, setAbuseModalOpen] = useState(false);
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'chat'

  const messagesEndRef = useRef(null);

  const fetchConversations = async () => {
    try {
      const res = await conversationAPI.getConversations();
      if (res.data?.success) {
        setConversations(res.data.conversations);
        if (res.data.conversations.length > 0 && !activeConversation) {
          // On desktop, auto-select first conversation
          if (window.innerWidth >= 768) {
            selectConversation(res.data.conversations[0]._id, false);
          }
        }
      }
    } catch (err) {
      console.error('[Fetch Conversations Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const selectConversation = async (conversationId, switchToChatMobile = true) => {
    setActiveConversation(conversationId);
    if (switchToChatMobile) {
      setMobileView('chat');
    }
    setLoadingMessages(true);
    try {
      const res = await conversationAPI.getConversationById(conversationId);
      if (res.data?.success && res.data?.conversation) {
        setActiveDetails(res.data.conversation);
        setMessages(res.data.conversation.messages || []);
      }
    } catch (err) {
      console.error('[Get Conversation Error]', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    setSending(true);
    try {
      const res = await conversationAPI.sendMessage(activeConversation, {
        text: newMessage.trim(),
      });
      if (res.data?.data) {
        setMessages((prev) => [...prev, res.data.data]);
        setNewMessage('');
        fetchConversations();
      }
    } catch (err) {
      alert(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading your secure conversations..." />;
  }

  const getOtherParticipant = (conv) => {
    if (!conv?.participants) return { name: 'Member' };
    return conv.participants.find((p) => p._id !== user._id) || conv.participants[0];
  };

  const otherParticipant = activeDetails ? getOtherParticipant(activeDetails) : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Secure Handover Messaging
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Direct, private communication between verified owners and finders without sharing personal phone numbers or emails.
        </p>
      </div>

      {conversations.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No conversations initiated yet"
          description="When an ownership claim is verified and approved, or when you reach out regarding a report, your chat threads will appear here."
          actionText="Browse Found Belongings"
          actionLink="/found-items"
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row h-[75vh] min-h-[500px]">
          {/* Left Column: Conversation List (Visible when mobileView === 'list' or on md+ screens) */}
          <div
            className={`w-full md:w-80 border-r border-slate-200 flex-col h-full bg-slate-50/60 ${
              mobileView === 'list' ? 'flex' : 'hidden md:flex'
            }`}
          >
            <div className="p-4 border-b border-slate-200 font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center justify-between">
              <span>Chats ({conversations.length})</span>
              <ShieldCheck className="w-4 h-4 text-blue-600" />
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {conversations.map((conv) => {
                const other = getOtherParticipant(conv);
                const lastMsg =
                  conv.messages && conv.messages.length > 0
                    ? conv.messages[conv.messages.length - 1]
                    : null;
                const isSelected = activeConversation === conv._id;

                return (
                  <div
                    key={conv._id}
                    onClick={() => selectConversation(conv._id, true)}
                    className={`p-4 cursor-pointer transition flex items-start space-x-3 ${
                      isSelected
                        ? 'bg-blue-50/90 border-r-4 border-blue-600'
                        : 'hover:bg-slate-100/70'
                    }`}
                  >
                    {other?.avatar ? (
                      <img
                        src={other.avatar}
                        alt={other.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                        {other?.name?.charAt(0) || 'U'}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {other?.name || 'Community Member'}
                        </h4>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap ml-1">
                          {formatTimeAgo(conv.lastMessageAt)}
                        </span>
                      </div>

                      <p className="text-[11px] font-bold text-blue-600 truncate mt-0.5">
                        {conv.relatedItem?.title || conv.subject}
                      </p>

                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {lastMsg ? lastMsg.text : 'Conversation initiated'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Chat Box (Visible when mobileView === 'chat' or on md+ screens) */}
          <div
            className={`flex-1 flex-col h-full bg-white ${
              mobileView === 'chat' ? 'flex' : 'hidden md:flex'
            }`}
          >
            {activeDetails ? (
              <>
                {/* Active Header */}
                <div className="p-3 sm:p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                    {/* Mobile Back Button */}
                    <button
                      type="button"
                      onClick={() => setMobileView('list')}
                      className="md:hidden p-1.5 -ml-1 rounded-xl text-slate-600 hover:bg-slate-200 transition"
                      aria-label="Back to conversations list"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>

                    {otherParticipant?.avatar ? (
                      <img
                        src={otherParticipant.avatar}
                        alt={otherParticipant.name}
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                        {otherParticipant?.name?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {otherParticipant?.name}
                      </h3>
                      {activeDetails.relatedItem && (
                        <Link
                          to={`/items/${activeDetails.relatedItem._id}`}
                          className="text-[11px] sm:text-xs text-blue-600 hover:underline flex items-center truncate font-medium"
                        >
                          <span className="truncate">Item: {activeDetails.relatedItem.title}</span>
                          <ExternalLink className="w-3 h-3 ml-1 flex-shrink-0" />
                        </Link>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAbuseModalOpen(true)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition"
                    title="Report Suspicious Interaction"
                  >
                    <ShieldAlert className="w-4 h-4" />
                  </button>
                </div>

                {/* Safety Tips Banner */}
                <div className="px-3 sm:px-4 py-2 bg-blue-50/60 border-b border-slate-100 text-[10px] sm:text-[11px] text-slate-600 flex items-center justify-between">
                  <span className="flex items-center truncate mr-2">
                    <Building2 className="w-3.5 h-3.5 mr-1.5 text-blue-600 flex-shrink-0" />
                    Meetup recommendation: Campus Security Desk or Student Union Foyer.
                  </span>
                  <span className="font-bold text-blue-700 hidden sm:inline whitespace-nowrap">
                    Safe Handover
                  </span>
                </div>

                {/* Messages Stream */}
                <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3 sm:space-y-4 bg-slate-50/30">
                  {loadingMessages ? (
                    <LoadingSpinner size="sm" message="Loading messages..." />
                  ) : messages.length > 0 ? (
                    messages.map((msg, idx) => {
                      const isMe = msg.sender?._id === user._id || msg.sender === user._id;
                      const isSystem = msg.text?.includes('System Notice:') || msg.text?.includes('🎉');
                      return (
                        <div
                          key={idx}
                          className={`flex flex-col ${
                            isSystem
                              ? 'items-center my-3'
                              : isMe
                              ? 'items-end'
                              : 'items-start'
                          }`}
                        >
                          {isSystem ? (
                            <div className="max-w-[90%] p-3 sm:p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-teal-900 font-medium text-center shadow-sm">
                              {msg.text}
                            </div>
                          ) : (
                            <div
                              className={`max-w-[85%] sm:max-w-[78%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                                isMe
                                  ? 'bg-blue-600 text-white rounded-br-none'
                                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                              }`}
                            >
                              {msg.text}
                            </div>
                          )}
                          <span className="text-[10px] text-slate-400 mt-1 px-1">
                            {formatTimeAgo(msg.timestamp)}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-12 text-center text-xs text-slate-400">
                      No messages yet. Send a greeting to coordinate your campus handover!
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Send Input Bar */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-2.5 sm:p-4 border-t border-slate-200 bg-white flex items-center space-x-2"
                >
                  <input
                    type="text"
                    required
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your safe handover message..."
                    className="flex-1 px-4 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center disabled:opacity-50"
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-slate-400 p-6 text-center">
                Select a conversation on the left to start coordinating handover
              </div>
            )}
          </div>
        </div>
      )}

      {/* Report Abuse Modal for Conversation */}
      {activeDetails && (
        <ReportAbuseModal
          isOpen={abuseModalOpen}
          onClose={() => setAbuseModalOpen(false)}
          targetType="conversation"
          targetId={activeDetails._id}
          targetTitle={`Conversation with ${otherParticipant?.name}`}
        />
      )}
    </div>
  );
};

export default ConversationsPage;
