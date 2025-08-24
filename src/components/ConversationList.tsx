'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMessaging, Conversation } from '../hooks/useMessaging';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListProps {
  onSelectConversation: (conversation: Conversation) => void;
  selectedMatchId?: string;
}

export default function ConversationList({ onSelectConversation, selectedMatchId }: ConversationListProps) {
  const { conversations, fetchConversations, isConnected } = useMessaging();
  const router = useRouter();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const formatLastMessageTime = (date?: Date) => {
    if (!date) return '';
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const truncateMessage = (content: string, maxLength: number = 50) => {
    return content.length > maxLength ? `${content.substring(0, maxLength)}...` : content;
  };

  return (
    <div className="h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back to Home"
            >
              <svg 
                className="w-5 h-5 text-gray-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
          </div>
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} 
               title={isConnected ? 'Connected' : 'Disconnected'} />
        </div>
      </div>

      {/* Conversations List */}
      <div className="overflow-y-auto h-full">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <div className="mb-4">
              <span className="text-4xl">💬</span>
            </div>
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs text-gray-400 mt-1">Start matching to begin chatting!</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.matchId}
              onClick={() => onSelectConversation(conversation)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedMatchId === conversation.matchId ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                {/* Profile Image */}
                <div className="relative">
                  {conversation.otherUser.image ? (
                    <img
                      src={conversation.otherUser.image}
                      alt={conversation.otherUser.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {conversation.otherUser.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  {/* Unread indicator */}
                  {conversation.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                    </div>
                  )}
                </div>

                {/* Conversation Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {conversation.otherUser.name}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {formatLastMessageTime(conversation.lastMessageAt)}
                    </span>
                  </div>
                  
                  {conversation.latestMessage ? (
                    <p className={`text-sm mt-1 truncate ${
                      conversation.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'
                    }`}>
                      {conversation.latestMessage.messageType === 'emoji' ? '📱' : ''}
                      {truncateMessage(conversation.latestMessage.content)}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 mt-1">
                      New match! Say hello 👋
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}