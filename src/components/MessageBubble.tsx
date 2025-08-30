'use client';

import { format } from 'date-fns';
import { Message } from '../hooks/usePusherMessaging';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  showTimestamp?: boolean;
  otherUserName?: string;
}

export default function MessageBubble({ message, isOwnMessage, showTimestamp = false, otherUserName }: MessageBubbleProps) {
  const getSenderName = () => {
    if (typeof message.senderId === 'object' && message.senderId.name) {
      return message.senderId.name;
    }
    return isOwnMessage ? 'You' : (otherUserName || 'User');
  };

  const getSenderImage = () => {
    if (typeof message.senderId === 'object') {
      return message.senderId.image;
    }
    return undefined;
  };

  const formatTime = (date: Date) => {
    return format(new Date(date), 'HH:mm');
  };

  return (
    <div className={`flex items-end space-x-2 mb-4 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {/* Profile Image - only show for other person's messages */}
      {!isOwnMessage && (
        <div className="flex-shrink-0">
          {getSenderImage() ? (
            <img
              src={getSenderImage()}
              alt={getSenderName()}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-xs">
                {getSenderName().charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Message Content */}
      <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-xs lg:max-w-md`}>
        {/* Sender name - show for all messages for clarity */}
        <span className={`text-xs text-gray-500 mb-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
          {getSenderName()}
        </span>
        
        {/* Message Bubble */}
        <div
          className={`px-4 py-2 rounded-2xl ${
            isOwnMessage
              ? 'bg-blue-500 text-white rounded-br-md'
              : 'bg-gray-200 text-gray-800 rounded-bl-md'
          } ${message.messageType === 'emoji' ? 'text-2xl p-2' : ''}`}
        >
          {message.messageType === 'image' ? (
            <img
              src={message.content}
              alt="Shared image"
              className="max-w-full h-auto rounded-lg"
            />
          ) : (
            <p className={`${message.messageType === 'emoji' ? 'text-center' : ''}`}>
              {message.content}
            </p>
          )}
        </div>

        {/* Timestamp and Read Status */}
        <div className={`flex items-center mt-1 space-x-1 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
          <span className="text-xs text-gray-500">
            {formatTime(message.createdAt)}
          </span>
          
          {/* Read indicator for own messages */}
          {isOwnMessage && (
            <div className="flex items-center">
              <span className={`text-xs ${message.isRead ? 'text-blue-500' : 'text-gray-400'}`}>
                {message.isRead ? '✓✓' : '✓'}
              </span>
            </div>
          )}
        </div>

        {/* Show full timestamp if requested */}
        {showTimestamp && (
          <span className="text-xs text-gray-400 mt-1">
            {format(new Date(message.createdAt), 'MMM d, yyyy HH:mm')}
          </span>
        )}
      </div>
    </div>
  );
}