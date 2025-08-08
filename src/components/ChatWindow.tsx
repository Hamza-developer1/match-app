'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useMessaging, Conversation, Message } from '../hooks/useMessaging';
import MessageBubble from './MessageBubble';

interface ChatWindowProps {
  conversation: Conversation;
  onClose?: () => void;
}

export default function ChatWindow({ conversation, onClose }: ChatWindowProps) {
  const { data: session } = useSession();
  const { messages, fetchMessages, sendMessage, sendTyping, markAsRead, typingUsers } = useMessaging();
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const conversationMessages = messages[conversation.matchId] || [];
  const [actualCurrentUserId, setActualCurrentUserId] = useState<string>('');
  const currentUserEmail = session?.user?.email;
  
  // Fetch current user's actual database ID
  useEffect(() => {
    if (session?.user?.email) {
      fetch('/api/profile')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user) {
            setActualCurrentUserId(data.user._id);
          }
        })
        .catch(() => {
          // Silently handle error
        });
    }
  }, [session?.user?.email]);

  useEffect(() => {
    if (conversation.matchId) {
      fetchMessages(conversation.matchId);
      // Mark messages as read when opening conversation
      markAsRead(conversation.matchId, conversation.otherUser._id);
    }
  }, [conversation.matchId, fetchMessages, markAsRead, conversation.otherUser._id]);

  useEffect(() => {
    scrollToBottom();
  }, [conversationMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    const messageContent = newMessage.trim();
    setNewMessage('');

    // Stop typing indicator
    handleTypingStop();

    try {
      await sendMessage(
        conversation.matchId,
        conversation.otherUser._id,
        messageContent
      );
    } catch (error) {
      console.error('Failed to send message:', error);
      // Restore message on error
      setNewMessage(messageContent);
    } finally {
      setIsSending(false);
    }
  };

  const handleTypingStart = () => {
    if (!isTyping) {
      setIsTyping(true);
      sendTyping(conversation.matchId, conversation.otherUser._id, true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      handleTypingStop();
    }, 2000);
  };

  const handleTypingStop = () => {
    if (isTyping) {
      setIsTyping(false);
      sendTyping(conversation.matchId, conversation.otherUser._id, false);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    handleTypingStart();
  };

  // Check if other user is typing
  const otherUserTyping = typingUsers.find(
    user => user.matchId === conversation.matchId && user.userId === conversation.otherUser._id && user.isTyping
  );

  const sendEmoji = async (emoji: string) => {
    setIsSending(true);
    try {
      await sendMessage(
        conversation.matchId,
        conversation.otherUser._id,
        emoji,
        'emoji'
      );
    } catch (error) {
      console.error('Failed to send emoji:', error);
    } finally {
      setIsSending(false);
    }
  };

  const quickEmojis = ['👋', '😊', '😂', '❤️', '👍', '👎', '🔥', '💯'];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Back button for mobile */}
            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden p-2 hover:bg-gray-200 rounded-full"
              >
                ←
              </button>
            )}
            
            {/* Profile info */}
            <div className="flex items-center space-x-3">
              {conversation.otherUser.image ? (
                <img
                  src={conversation.otherUser.image}
                  alt={conversation.otherUser.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {conversation.otherUser.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900">{conversation.otherUser.name}</h3>
                <p className="text-sm text-gray-500">
                  {otherUserTyping ? 'typing...' : 'Active now'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {conversationMessages.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">👋</div>
            <p className="text-gray-500">You matched with {conversation.otherUser.name}!</p>
            <p className="text-sm text-gray-400 mt-1">Start the conversation with a friendly message.</p>
          </div>
        ) : (
          conversationMessages.map((message, index) => {
            // Check if this message was sent by the current user
            const messageSenderId = typeof message.senderId === 'string' 
              ? message.senderId 
              : message.senderId._id;
              
            // Use the reliably fetched user ID
            const isOwnMessage = actualCurrentUserId && messageSenderId === actualCurrentUserId;
            
            return (
              <MessageBubble
                key={message._id}
                message={message}
                isOwnMessage={!!isOwnMessage}
              />
            );
          })
        )}
        
        {/* Typing indicator */}
        {otherUserTyping && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-xs">
                {conversation.otherUser.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="bg-gray-200 rounded-xl px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Emojis */}
      <div className="px-4 py-2 border-t border-gray-100">
        <div className="flex space-x-2 overflow-x-auto">
          {quickEmojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => sendEmoji(emoji)}
              disabled={isSending}
              className="flex-shrink-0 p-2 text-xl hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              onBlur={handleTypingStop}
              placeholder={`Message ${conversation.otherUser.name}...`}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              disabled={isSending}
            />
          </div>
          
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}