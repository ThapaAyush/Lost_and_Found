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
  Check,
  CheckCheck,
  Search,
  Package,
  Sparkles,
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
  const [searchQuery, setSearchQuery] = useState('');
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

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    if (!conv?.participants) return { name: 'Member' };
    return conv.participants.find((p) => p._id !== user._id) || conv.participants[0];
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
    return <LoadingSpinner size="lg" message="Loading your conversations..." />;
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Page Title & Clean Subtitle */}
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
            Private direct messaging to coordinate returns and verified belongings safely.
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
        /* Main Chat Container */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row h-[78vh] min-h-[540px] max-h-[760px]">
          {/* ===================== Left Column: Chats List ===================== */}
          <div
            className={`w-full md:w-80 lg:w-96 border-r border-slate-200 flex-col h-full bg-slate-50/50 ${
              mobileView === 'list' ? 'flex' : 'hidden md:flex'
            }`}
          >
            {/* Search / Filter in Chat List */}
            <div className="p-3.5 border-b border-slate-200 bg-white space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Conversations
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  {filteredConversations.length} total
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search chats or items..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              </div>
            </div>

            {/* Conversation Threads Scroll Area */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredConversations.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 p-4">
                  No matching chats found
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const other = getOtherParticipant(conv);
                  const lastMsg =
                    conv.messages && conv.messages.length > 0
                      ? conv.messages[conv.messages.length - 1]
                      : null;
                  const isSelected = activeConversation === conv._id;

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
                      onClick={() => selectConversation(conv._id, true)}
                      className={`p-3.5 sm:p-4 cursor-pointer transition flex items-start space-x-3 border-l-4 ${
                        isSelected
                          ? 'bg-blue-50/90 border-l-blue-600'
                          : hasUnread
                          ? 'bg-blue-50/40 hover:bg-blue-50/70 border-l-blue-500'
                          : 'hover:bg-slate-100/70 border-l-transparent bg-white'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        {other?.avatar ? (
                          <img
                            src={other.avatar}
                            alt={other.name}
                            className="w-11 h-11 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm shadow-xs">
                            {other?.name?.charAt(0) || 'U'}
                          </div>
                        )}
                        {hasUnread && (
                          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-blue-600 rounded-full ring-2 ring-white" />
                        )}
                      </div>

                      {/* Info & Snippet */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h4
                            className={`text-xs truncate ${
                              hasUnread || isSelected
                                ? 'font-black text-slate-900'
                                : 'font-bold text-slate-800'
                            }`}
                          >
                            {other?.name || 'Community Member'}
                          </h4>
                          <span
                            className={`text-[10px] whitespace-nowrap ml-1.5 ${
                              hasUnread ? 'text-blue-600 font-bold' : 'text-slate-400'
                            }`}
                          >
                            {formatTimeAgo(conv.lastMessageAt)}
                          </span>
                        </div>

                        {/* Related item subject pill */}
                        {(conv.relatedItem?.title || conv.subject) && (
                          <div className="flex items-center text-[10px] font-bold text-blue-600 truncate mb-1">
                            <Package className="w-3 h-3 mr-1 shrink-0 text-blue-500" />
                            <span className="truncate">
                              {conv.relatedItem?.title || conv.subject}
                            </span>
                          </div>
                        )}

                        {/* Last message preview */}
                        <div className="flex items-center justify-between">
                          <p
                            className={`text-xs truncate ${
                              hasUnread
                                ? 'font-bold text-slate-800'
                                : 'font-normal text-slate-500'
                            }`}
                          >
                            {lastMsg ? lastMsg.text : 'Conversation initiated'}
                          </p>
                          {hasUnread && (
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-blue-600 text-white shrink-0 ml-1.5">
                              {unreadMsgCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ===================== Right Column: Active Chat ===================== */}
          <div
            className={`flex-1 flex-col h-full bg-white ${
              mobileView === 'chat' ? 'flex' : 'hidden md:flex'
            }`}
          >
            {activeDetails ? (
              <>
                {/* Active Chat Header */}
                <div className="p-3.5 sm:p-4 border-b border-slate-200 flex items-center justify-between bg-white shadow-xs">
                  <div className="flex items-center space-x-3 min-w-0">
                    {/* Mobile Back Button */}
                    <button
                      type="button"
                      onClick={() => setMobileView('list')}
                      className="md:hidden p-1.5 -ml-1 rounded-xl text-slate-600 hover:bg-slate-100 transition"
                      aria-label="Back to conversations list"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>

                    {/* Participant Avatar */}
                    {otherParticipant?.avatar ? (
                      <img
                        src={otherParticipant.avatar}
                        alt={otherParticipant.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm shrink-0">
                        {otherParticipant?.name?.charAt(0) || 'U'}
                      </div>
                    )}

                    {/* Participant Name & Item link */}
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <h3 className="text-sm font-black text-slate-900 truncate">
                          {otherParticipant?.name}
                        </h3>
                        <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" title="Verified Member" />
                      </div>

                      {activeDetails.relatedItem && (
                        <Link
                          to={`/items/${activeDetails.relatedItem._id}`}
                          className="inline-flex items-center text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline truncate mt-0.5"
                          title="Open item details in new tab"
                        >
                          <Package className="w-3 h-3 mr-1 shrink-0 text-blue-500" />
                          <span className="truncate">{activeDetails.relatedItem.title}</span>
                          <ExternalLink className="w-2.5 h-2.5 ml-1 shrink-0 opacity-70" />
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Header Actions */}
                  <div className="flex items-center space-x-1">
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
                <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3.5 bg-slate-50/50">
                  {loadingMessages ? (
                    <LoadingSpinner size="sm" message="Loading messages..." />
                  ) : messages.length > 0 ? (
                    messages.map((msg, idx) => {
                      const isMe = msg.sender?._id === user._id || msg.sender === user._id;
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
                              className={`max-w-[85%] sm:max-w-[75%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
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

                {/* Send Input Bar */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 sm:p-4 border-t border-slate-200 bg-white flex items-center space-x-2.5"
                >
                  <input
                    type="text"
                    required
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-xs sm:text-sm border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition placeholder-slate-400 text-slate-900"
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="p-2.5 sm:px-4 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-sm shadow-blue-500/20 transition flex items-center justify-center space-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
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
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-700">No chat selected</h3>
                <p className="text-xs text-slate-400 max-w-xs">
                  Choose a conversation from the list on the left to read messages and reply.
                </p>
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
