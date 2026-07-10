import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, MessageSquare, ArrowLeft, Star, MapPin, ExternalLink, Calendar, Check } from 'lucide-react';
import { backendApi as api } from '../services/backendApi';
import type { Chat, Message } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { EmptyState } from '../components/EmptyState';
import { getSocket } from '../services/socket';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();

  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [showThreadOnMobile, setShowThreadOnMobile] = useState(false);

  // Review states inside chat
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHover, setReviewHover] = useState<number | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const [isMarkingSold, setIsMarkingSold] = useState(false);
  const [isConfirmingReceipt, setIsConfirmingReceipt] = useState(false);
  const [isCancelingSale, setIsCancelingSale] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load Chats on Mount
  useEffect(() => {
    const loadChats = async () => {
      if (!user) return;
      setIsLoadingChats(true);
      try {
        const list = await api.getChats(user.id);
        setChats(list);

        // Check if navigated from listing details with state request
        const stateActiveId = (location.state as any)?.activeChatId;
        if (stateActiveId) {
          const found = list.find(c => c.id === stateActiveId);
          if (found) {
            setActiveChat(found);
            setShowThreadOnMobile(true);
          }
        } else if (list.length > 0) {
          // Select first chat by default on desktop
          setActiveChat(list[0]);
        }
      } catch (err) {
        console.error('Error fetching chats', err);
      } finally {
        setIsLoadingChats(false);
      }
    };
    loadChats();
  }, [user, location.state]);

  // Load Messages when active chat changes
  useEffect(() => {
    const loadMessages = async () => {
      if (!activeChat) return;
      setIsLoadingMessages(true);
      try {
        const msgs = await api.getMessages(activeChat.id);
        setMessages(msgs);
        
        // Mark as read in backend and local state
        await api.markChatAsRead(activeChat.id);
        setChats(prev => prev.map(c => c.id === activeChat.id ? { ...c, unread: false } : c));
      } catch (err) {
        console.error('Error loading messages', err);
      } finally {
        setIsLoadingMessages(false);
      }
    };
    loadMessages();
  }, [activeChat]);

  // Scroll to bottom of message list
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Listen for incoming real-time socket messages
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleIncomingMessage = (newMsg: Message) => {
      // If the incoming message belongs to our currently active conversation:
      if (activeChat && newMsg.chatId === activeChat.id) {
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        // Auto mark as read in backend
        api.markChatAsRead(activeChat.id);
      }

      // Update the chat preview in the sidebar and move to top
      setChats(prev => {
        return prev.map(c => {
          if (c.id === newMsg.chatId) {
            return {
              ...c,
              lastMessage: newMsg.text,
              lastMessageTime: newMsg.timestamp,
              unread: activeChat ? c.id !== activeChat.id : true
            };
          }
          return c;
        }).sort((a, b) => {
          const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
          const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
          return timeB - timeA;
        });
      });
    };

    const handleChatStatusUpdated = (data: { chatId: string, listingId: string | null, type: string }) => {
      const applyStatusUpdate = (chat: Chat) => {
        if (chat.id !== data.chatId) return chat;
        const updatedChat = { ...chat };
        switch (data.type) {
          case 'sale_pending':
            updatedChat.bookIsSold = false;
            updatedChat.salePending = true;
            updatedChat.buyerConfirmedReceipt = false;
            break;
          case 'sale_confirmed':
            updatedChat.bookIsSold = true;
            updatedChat.salePending = false;
            updatedChat.buyerConfirmedReceipt = true;
            break;
          case 'sale_denied':
          case 'sale_canceled':
            updatedChat.bookIsSold = false;
            updatedChat.salePending = false;
            updatedChat.buyerConfirmedReceipt = false;
            break;
        }
        return updatedChat;
      };

      setChats(prev => prev.map(applyStatusUpdate));
      setActiveChat(prev => prev ? applyStatusUpdate(prev) : prev);
    };

    socket.on('message', handleIncomingMessage);
    socket.on('chat_status_updated', handleChatStatusUpdated);

    return () => {
      socket.off('message', handleIncomingMessage);
      socket.off('chat_status_updated', handleChatStatusUpdated);
    };
  }, [activeChat]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChat || !user) return;

    const text = inputText.trim();
    setInputText('');

    try {
      const newMsg = await api.sendMessage(activeChat.id, user.id, text);
      setMessages(prev => [...prev, newMsg]);

      // Update last message preview in chat list sidebar
      setChats(prev => prev.map(c => {
        if (c.id === activeChat.id) {
          return {
            ...c,
            lastMessage: text,
            lastMessageTime: newMsg.timestamp
          };
        }
        return c;
      }));

    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to send message.', 'danger');
    }
  };

  const handleReviewSubmit = async () => {
    if (!activeChat || !reviewComment.trim()) return;
    setIsSubmittingReview(true);
    try {
      await api.addReview(activeChat.sellerId, reviewRating, reviewComment.trim());
      showToast(`Review submitted successfully for ${activeChat.otherParticipant.name}!`, 'success');
      setShowReviewModal(false);
      setReviewComment('');
      setReviewRating(5);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to submit review.', 'danger');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleMarkAsSold = async () => {
    if (!activeChat) return;
    setIsMarkingSold(true);
    try {
      await api.markAsSold(activeChat.bookId);
      setActiveChat(prev => prev ? { ...prev, bookIsSold: true } : prev);
      setChats(prev => prev.map(c => c.id === activeChat.id ? { ...c, bookIsSold: true } : c));
      showToast('Book marked as sold successfully!', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to update book status.', 'danger');
    } finally {
      setIsMarkingSold(false);
    }
  };

  const handleConfirmReceipt = async () => {
    if (!activeChat) return;
    setIsConfirmingReceipt(true);
    try {
      await api.confirmReceipt(activeChat.bookId);
      setActiveChat(prev => prev ? { ...prev, buyerConfirmedReceipt: true, bookIsSold: true, salePending: false } : prev);
      setChats(prev => prev.map(c => c.id === activeChat.id ? { ...c, buyerConfirmedReceipt: true, bookIsSold: true, salePending: false } : c));
      showToast('Receipt confirmed successfully! Thank you.', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to confirm receipt.', 'danger');
    } finally {
      setIsConfirmingReceipt(false);
    }
  };

  const handleCancelPendingSale = async () => {
    if (!activeChat) return;
    const isBuyerUser = user?.id === activeChat.buyerId;
    const promptMsg = isBuyerUser
      ? 'Are you sure you want to deny this purchase? If you did not receive this item, denying the sale will cancel the trade and report the seller for potential fraud.'
      : 'Are you sure you want to cancel this pending sale? This will make the listing active for other buyers again.';

    if (!window.confirm(promptMsg)) return;
    setIsCancelingSale(true);
    try {
      await api.cancelPendingSale(activeChat.bookId);
      setActiveChat(prev => prev ? { ...prev, salePending: false, bookIsSold: false, buyerConfirmedReceipt: false } : prev);
      setChats(prev => prev.map(c => c.id === activeChat.id ? { ...c, salePending: false, bookIsSold: false, buyerConfirmedReceipt: false } : c));
      showToast(isBuyerUser ? 'Purchase denied and sale canceled successfully.' : 'Pending sale canceled successfully. Listing is now active.', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to cancel pending sale.', 'danger');
    } finally {
      setIsCancelingSale(false);
    }
  };

  const selectChat = (chat: Chat) => {
    setActiveChat(chat);
    setShowThreadOnMobile(true);
    // Mark as read
    api.markChatAsRead(chat.id);
    setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unread: false } : c));
  };

  const getFormattedTime = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoadingChats) {
    return (
      <div className="flex flex-1 min-h-0 border border-borderCustom rounded-2xl bg-white overflow-hidden animate-pulse">
        <div className="w-80 border-r border-borderCustom bg-slate-50 p-4 flex flex-col gap-4">
          <div className="h-6 w-24 bg-slate-200 rounded" />
          <div className="h-10 bg-slate-200 rounded-lg" />
          <div className="h-12 bg-slate-200 rounded-lg" />
          <div className="h-12 bg-slate-200 rounded-lg" />
        </div>
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div className="h-10 bg-slate-200 rounded-lg w-1/3" />
          <div className="h-40 bg-slate-200 rounded-2xl w-full" />
          <div className="h-10 bg-slate-200 rounded-lg w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 min-h-0 h-full bg-white overflow-hidden shadow-subtle border-0 rounded-none mt-0 md:border md:border-borderCustom md:rounded-2xl md:-mt-2">
      {/* Sidebar: Conversation List */}
      <aside className={`w-full md:w-80 border-r border-borderCustom flex flex-col flex-shrink-0 ${
        showThreadOnMobile ? 'hidden md:flex' : 'flex'
      }`}>
        <div className="px-4 py-3 border-b border-borderCustom bg-slate-50 flex items-center justify-between">
          <h2 className="font-extrabold text-sm text-textDark tracking-tight flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span>Chat Box</span>
          </h2>
          <span className="bg-slate-200 text-textDark text-[10px] font-bold px-2 py-0.5 rounded-full">
            {chats.filter(c => c.unread).length} New
          </span>
        </div>

        {/* Conversations Scroll Panel */}
        <div className="flex-1 overflow-y-auto divide-y divide-borderCustom">
          {chats.length > 0 ? (
            chats.map(chat => {
              const isActive = activeChat?.id === chat.id;
              return (
                <button
                  key={chat.id}
                  onClick={() => selectChat(chat)}
                  className={`w-full text-left p-3.5 flex gap-3 transition-colors hover:bg-slate-50 focus:outline-none ${
                    isActive ? 'bg-primary/5' : ''
                  }`}
                >
                  <img
                    src={chat.otherParticipant.avatar}
                    alt={chat.otherParticipant.name}
                    className="w-10 h-10 rounded-full border border-borderCustom object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h4 className={`text-xs font-bold text-textDark truncate ${chat.unread ? 'font-black' : ''}`}>
                        {chat.otherParticipant.name}
                      </h4>
                      <span className="text-[9px] text-muted font-medium flex-shrink-0">
                        {getFormattedTime(chat.lastMessageTime)}
                      </span>
                    </div>
                    <p className="text-[10px] text-primary font-bold mt-0.5 truncate leading-tight">
                      Item: {chat.bookTitle}
                    </p>
                    <p className={`text-[11px] text-muted mt-1 truncate ${chat.unread ? 'text-textDark font-semibold' : ''}`}>
                      {chat.lastMessage}
                    </p>
                  </div>
                  {chat.unread && (
                    <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1 flex-shrink-0 self-center" />
                  )}
                </button>
              );
            })
          ) : (
            <div className="p-8 text-center">
              <p className="text-xs text-muted">No active conversations found.</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Panel: Chat Thread */}
      <section className={`flex-1 flex flex-col bg-slate-50 min-w-0 ${
        showThreadOnMobile ? 'flex' : 'hidden md:flex'
      }`}>
        {activeChat ? (
          <>
            <div className="px-3 py-2.5 border-b border-borderCustom bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex-shrink-0">
              {/* Top row: Back + User info + Book thumbnail */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {/* Back Arrow for Mobile */}
                  <button
                    onClick={() => setShowThreadOnMobile(false)}
                    className="md:hidden p-1 rounded-full hover:bg-slate-100 text-muted hover:text-textDark focus:outline-none flex-shrink-0"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <img
                    src={activeChat.otherParticipant.avatar}
                    alt={activeChat.otherParticipant.name}
                    className="w-8 h-8 rounded-full border border-borderCustom object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-bold text-textDark truncate leading-snug">
                      {activeChat.otherParticipant.name}
                    </h3>
                    <div className="flex items-center gap-1 text-[10px] text-muted mt-0.5">
                      <span className="font-semibold text-warning">&#9733; {activeChat.otherParticipant.rating.toFixed(1)}</span>
                      <span>&middot;</span>
                      <span className="truncate">{activeChat.otherParticipant.college?.split(',')[0] || 'Unknown'}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {user?.id === activeChat.buyerId && (
                    <button
                      onClick={() => setShowReviewModal(true)}
                      className="bg-primary hover:bg-primary-hover active:bg-primary-active text-white text-[10px] font-bold p-2 rounded-lg transition-colors flex items-center gap-1 shadow-subtle focus:outline-none"
                      title={`Review ${activeChat.otherParticipant.name}`}
                    >
                      <Star className="w-3.5 h-3.5 fill-current text-white" />
                      <span className="hidden sm:inline">Review</span>
                    </button>
                  )}

                  {/* Buyer Actions */}
                  {user?.id === activeChat.buyerId && (
                    activeChat.bookIsSold ? (
                      <div className="bg-green-50 text-green-700 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-green-200 cursor-default flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Received</span>
                      </div>
                    ) : activeChat.salePending ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={handleConfirmReceipt}
                          disabled={isConfirmingReceipt}
                          className="bg-primary hover:bg-primary/95 active:bg-primary text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-subtle focus:outline-none disabled:opacity-50"
                          title="Confirm Receipt of Book"
                        >
                          <span>{isConfirmingReceipt ? '...' : 'Confirm Receipt'}</span>
                        </button>
                        <button
                          onClick={handleCancelPendingSale}
                          disabled={isCancelingSale}
                          className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors shadow-subtle focus:outline-none disabled:opacity-50"
                          title="Deny Purchase"
                        >
                          <span>Deny</span>
                        </button>
                      </div>
                    ) : null
                  )}

                  {/* Seller Actions */}
                  {user?.id === activeChat.sellerId && (
                    activeChat.bookIsSold ? (
                      <div className="bg-slate-100 text-slate-400 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 cursor-default">
                        Sold
                      </div>
                    ) : activeChat.salePending ? (
                      <div className="flex items-center gap-1">
                        <div className="bg-yellow-50 text-yellow-800 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-yellow-200 cursor-default">
                          Pending Buyer
                        </div>
                        <button
                          onClick={handleCancelPendingSale}
                          disabled={isCancelingSale}
                          className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors shadow-subtle focus:outline-none disabled:opacity-50"
                          title="Cancel Pending Sale"
                        >
                          <span>Cancel</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleMarkAsSold}
                        disabled={isMarkingSold}
                        className="bg-success hover:bg-success/90 active:bg-success text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-subtle focus:outline-none disabled:opacity-50"
                        title="Mark book as sold"
                      >
                        <span>{isMarkingSold ? '...' : 'Sold'}</span>
                      </button>
                    )
                  )}

                  <div className="flex items-center gap-1.5 border border-borderCustom rounded-lg p-1 bg-slate-50">
                    <img
                      src={activeChat.bookImage}
                      alt={activeChat.bookTitle}
                      className="w-7 h-7 rounded border border-borderCustom object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 hidden sm:block max-w-[120px]">
                      <p className="text-[10px] font-bold text-textDark truncate leading-tight">{activeChat.bookTitle}</p>
                      <span className="text-[9px] text-muted font-bold block mt-0.5">₹{activeChat.bookPrice}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Message Feed Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {messages.map(msg => {
                const isMe = msg.senderId === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[75%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
                  >
                    <div className={`p-3 rounded-2xl text-xs shadow-subtle ${
                      isMe
                        ? 'bg-primary text-white rounded-tr-none'
                        : 'bg-white text-textDark border border-borderCustom rounded-tl-none'
                    }`}>
                      <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                    </div>
                    <span className="text-[9px] text-muted font-medium mt-1 px-1">
                      {getFormattedTime(msg.timestamp)}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Form */}
            {activeChat.otherParticipant.blocked || activeChat.otherParticipant.flagged ? (
              <div className="p-3.5 bg-red-50 border-t border-red-100 text-center text-xs font-bold text-red-600 flex-shrink-0">
                🚫 Messaging is disabled because this user's account is suspended or under review.
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-borderCustom flex items-center gap-2 flex-shrink-0">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your message here..."
                  className="flex-1 bg-background border border-borderCustom rounded-full py-2 px-4 text-xs text-textDark placeholder-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="bg-primary hover:bg-primary-hover text-white p-2.5 rounded-full transition-colors flex items-center justify-center flex-shrink-0 shadow-subtle hover:shadow focus:outline-none disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <EmptyState
              type="messages"
              title="No Active Chat Selected"
              description="Choose a conversation thread from the sidebar to coordinate pick-up instructions, check book quality, or negotiate discounts."
            />
          </div>
        )}
      </section>

      {/* Review Modal Overlay */}
      {showReviewModal && activeChat && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-borderCustom rounded-2xl w-full max-w-md p-6 shadow-xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <h3 className="font-extrabold text-sm text-textDark">Review {activeChat.otherParticipant.name}</h3>
              <p className="text-[11px] text-muted mt-0.5">Share your experience buying "{activeChat.bookTitle}"</p>
            </div>

            {/* Star Rating selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-textDark">Rating:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    onMouseEnter={() => setReviewHover(star)}
                    onMouseLeave={() => setReviewHover(null)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= (reviewHover || reviewRating)
                          ? 'text-warning fill-current'
                          : 'text-slate-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment Textarea */}
            <div className="flex flex-col gap-1.5">
              <textarea
                rows={3}
                placeholder="Write your review... (e.g. 'Very friendly, punctual during exchange, and book is in perfect condition.')"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full bg-[#F5F3EF] border border-borderCustom rounded-[10px] p-3 text-xs text-textDark placeholder-muted focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed resize-none"
                required
              />
            </div>

            <div className="flex gap-2.5 justify-end mt-2">
              <button
                type="button"
                onClick={() => {
                  setShowReviewModal(false);
                  setReviewComment('');
                  setReviewRating(5);
                }}
                className="border border-borderCustom hover:bg-slate-50 text-textDark text-xs font-bold px-4 py-2.5 rounded-lg transition-colors focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReviewSubmit}
                disabled={isSubmittingReview}
                className="bg-primary hover:bg-primary-hover active:bg-primary-active text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-subtle disabled:opacity-50"
              >
                {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
