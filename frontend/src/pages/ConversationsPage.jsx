import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  User,
  Clock,
  ShieldAlert,
  Loader2,
  ExternalLink,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCheck,
  Search,
  Package,
  Sparkles,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { conversationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ReportAbuseModal from '../components/ReportAbuseModal';
import { formatTimeAgo } from '../utils/formatters';

const ConversationsPage = () => {
  const { user } = useAuth();
  const location = useLocation();

  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeConversation, setActiveConversation] = useState(null);
  const [activeDetails, setActiveDetails] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [abuseModalOpen, setAbuseModalOpen] = useState(false);

  const messagesEndRef = useRef(null);

  const fetchConversations = async () => {
    try {
      const res = await conversationAPI.getConversations();
      if (res.data?.success) {
        setConversations(res.data.conversations || []);
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

  // If navigated here with a specific conversation ID or item ID (e.g. from notification or claim)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const targetConvId =
      location.state?.conversationId ||
      searchParams.get('conversationId') ||
      searchParams.get('id');
    const targetItemId = location.state?.itemId || searchParams.get('itemId');

    if (targetConvId) {
      selectConversation(targetConvId);
      return;
    }

    if (targetItemId && conversations.length > 0) {
      const match = conversations.find(
        (c) =>
          (c.relatedItem?._id || c.relatedItem || '').toString() ===
          targetItemId.toString()
      );
      if (match) {
        selectConversation(match._id);
      }
    }
  }, [conversations, location.state, location.search]);

  const selectConversation = async (conversationId) => {
    setActiveConversation(conversationId);

    // Optimistically mark messages in this conversation as seen in local state
    setConversations((prev) =>
      prev.map((c) => {
        if (c._id === conversationId && c.messages) {
          return {
            ...c,
            messages: c.messages.map((m) => ({ ...m, isRead: true })),
          };
        }
        return c;
      })
    );

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

  const handleBackToList = () => {
    setActiveConversation(null);
    setActiveDetails(null);
    setMessages([]);
    fetchConversations();
  };

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (activeConversation) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeConversation]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || sending) return;

    setSending(true);
    const messageText = newMessage.trim();
    try {
      const res = await conversationAPI.sendMessage(activeConversation, {
        text: messageText,
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

  const getOtherParticipant = (conv) => {
    if (!conv?.participants) return { name: 'Community Member' };
    return conv.participants.find((p) => p._id !== user?._id) || conv.participants[0] || { name: 'Community Member' };
  };

  const otherParticipant = activeDetails ? getOtherParticipant(activeDetails) : null;

  // Filter conversations by search input
  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const other = getOtherParticipant(conv);
    const otherName = (other?.name || '').toLowerCase();
    const subject = (conv.relatedItem?.title || conv.subject || '').toLowerCase();
    return otherName.includes(q) || subject.includes(q);
  });

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading your messages..." />;
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* -------------------- VIEW 1: CONTACTS / PEOPLE DIRECTORY (Shown First) -------------------- */}
      {!activeConversation ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Messages
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {conversations.length} {conversations.length === 1 ? 'chat' : 'chats'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Select a community member below to open your chat and coordinate safe handovers.
              </p>
            </div>
          </div>

          {conversations.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="No conversations yet"
              description="When you reach out regarding an item or when an ownership claim is initiated, your chat threads will appear here."
              actionText="Browse Found Belongings"
              actionLink="/found-items"
            />
          ) : (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative max-w-md">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by contact name or item..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white text-xs sm:text-sm border border-slate-200 rounded-2xl shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition placeholder-slate-400"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>

              {/* People Cards Grid / List */}
              {filteredConversations.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-400">
                  No matching chats found for "{searchQuery}"
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {filteredConversations.map((conv) => {
                    const other = getOtherParticipant(conv);
                    const itemSubject = (conv.relatedItem?.title || conv.subject || '').replace(/^Regarding:\s*/i, '');

                    const unreadMsgCount =
                      conv.messages?.filter((m) => {
                        const senderId = (m.sender?._id || m.sender || '').toString();
                        const myId = (user?._id || '').toString();
                        return senderId && senderId !== myId && !m.isRead;
                      }).length || 0;
                    const hasUnread = unreadMsgCount > 0;

                    return (
                      <div
                        key={conv._id}
                        onClick={() => selectConversation(conv._id)}
                        className={`bg-white rounded-3xl border p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                          hasUnread
                            ? 'border-blue-300 bg-blue-50/20 hover:border-blue-500'
                            : 'border-slate-200 hover:border-blue-400'
                        }`}
                      >
                        {/* Left Side: Avatar & Details */}
                        <div className="flex items-center space-x-4 min-w-0">
                          {/* Avatar */}
                          <div className="relative shrink-0">
                            {other?.avatar ? (
                              <img
                                src={other.avatar}
                                alt={other.name}
                                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border border-slate-200 shadow-xs"
                              />
                            ) : (
                              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-xs">
                                {other?.name?.charAt(0) || 'U'}
                              </div>
                            )}
                            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-white" />
                          </div>

                          {/* Info */}
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-base font-black text-slate-900 group-hover:text-blue-600 transition truncate">
                                {other?.name || 'Community Member'}
                              </h3>
                              <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" title="Verified Member" />
                            </div>

                            {/* Regarding Item */}
                            {itemSubject && (
                              <div className="inline-flex items-center text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 truncate">
                                <Package className="w-3.5 h-3.5 mr-1 text-blue-500 shrink-0" />
                                <span className="truncate">Regarding: {itemSubject}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right Side: Timestamp & Open Button */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 gap-2">
                          <span className="text-[11px] text-slate-400 font-medium">
                            {formatTimeAgo(conv.lastMessageAt)}
                          </span>
                          <div className="flex items-center space-x-2">
                            {hasUnread && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-600 text-white">
                                {unreadMsgCount} new
                              </span>
                            )}
                            <button
                              type="button"
                              className="px-4 py-2 rounded-xl bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-700 text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
                            >
                              <span>Open Chat</span>
                              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* -------------------- VIEW 2: ACTIVE CHAT CONVERSATION -------------------- */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[82vh] min-h-[580px] max-h-[840px]">
          {/* Active Chat Top Header */}
          <div className="p-3.5 sm:p-4 border-b border-slate-200 flex items-center justify-between bg-white shadow-xs shrink-0">
            <div className="flex items-center space-x-3 min-w-0">
              {/* Back to People List Button */}
              <button
                type="button"
                onClick={handleBackToList}
                className="inline-flex items-center px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition mr-1 shrink-0"
                title="Return to conversation list"
              >
                <ArrowLeft className="w-4 h-4 mr-1 text-slate-600" />
                <span className="hidden sm:inline">All Chats</span>
                <span className="sm:hidden">Back</span>
              </button>

              {/* Participant Avatar */}
              <div className="relative shrink-0">
                {otherParticipant?.avatar ? (
                  <img
                    src={otherParticipant.avatar}
                    alt={otherParticipant.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                    {otherParticipant?.name?.charAt(0) || 'U'}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
              </div>

              {/* Participant Name & Item Info */}
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5">
                  <h3 className="text-sm font-black text-slate-900 truncate">
                    {otherParticipant?.name}
                  </h3>
                  <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" title="Verified Member" />
                </div>

                {activeDetails?.relatedItem && (
                  <Link
                    to={`/items/${activeDetails.relatedItem._id}`}
                    className="inline-flex items-center text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline truncate mt-0.5"
                    title="Open item details"
                  >
                    <Package className="w-3 h-3 mr-1 shrink-0 text-blue-500" />
                    <span className="truncate">{activeDetails.relatedItem.title}</span>
                    <ExternalLink className="w-2.5 h-2.5 ml-1 shrink-0 opacity-70" />
                  </Link>
                )}
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setAbuseModalOpen(true)}
                className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition"
                title="Report Suspicious Interaction"
              >
                <ShieldAlert className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3.5 bg-slate-50/60">
            <div className="max-w-3xl mx-auto w-full space-y-3.5">
              {loadingMessages ? (
                <LoadingSpinner size="sm" message="Loading messages..." />
              ) : messages.length > 0 ? (
                messages.map((msg, idx) => {
                  const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;
                  const isSystem =
                    msg.text?.includes('System Notice:') ||
                    msg.text?.includes('🎉') ||
                    msg.text?.includes('Claim Approved');

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
                        <div className="max-w-[90%] p-3 sm:p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-teal-900 font-medium text-center shadow-xs">
                          {msg.text}
                        </div>
                      ) : (
                        <div
                          className={`max-w-[85%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                            isMe
                              ? 'bg-blue-600 text-white rounded-br-xs'
                              : 'bg-white border border-slate-200 text-slate-900 rounded-bl-xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                        </div>
                      )}

                      {/* Message Time & Seen Status */}
                      {!isSystem && (
                        <div
                          className={`flex items-center space-x-1 text-[10px] text-slate-400 mt-1 px-1 ${
                            isMe ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <span>{formatTimeAgo(msg.timestamp)}</span>
                          {isMe && (
                            <span className="ml-1 inline-flex items-center">
                              {msg.isRead ? (
                                <span className="flex items-center text-teal-600 font-semibold" title="Seen">
                                  <CheckCheck className="w-3.5 h-3.5" />
                                </span>
                              ) : (
                                <span className="flex items-center text-slate-400" title="Sent">
                                  <Check className="w-3.5 h-3.5" />
                                </span>
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-16 text-center text-xs text-slate-400">
                  No messages yet. Send a greeting to start the conversation!
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Send Input Bar */}
          <div className="border-t border-slate-200 bg-white p-3 sm:p-4 shrink-0">
            <form
              onSubmit={handleSendMessage}
              className="max-w-3xl mx-auto w-full flex items-center space-x-2.5"
            >
              <input
                type="text"
                required
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2.5 sm:py-3 bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-xs sm:text-sm border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition placeholder-slate-400 text-slate-900"
              />
              <button
                type="submit"
                disabled={sending || !newMessage.trim()}
                className="px-4 sm:px-5 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-sm shadow-blue-500/20 transition flex items-center justify-center space-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                title="Send message"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Send</span>
                  </>
                )}
              </button>
            </form>
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
