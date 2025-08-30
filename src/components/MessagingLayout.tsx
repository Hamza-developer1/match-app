'use client';

import { useState } from 'react';
import { Conversation } from '../hooks/usePusherMessaging';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';

export default function MessagingLayout() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowMobileChat(true);
  };

  const handleCloseMobileChat = () => {
    setShowMobileChat(false);
    setSelectedConversation(null);
  };

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Conversation List - Hidden on mobile when chat is open */}
      <div className={`w-full md:w-80 lg:w-96 ${showMobileChat ? 'hidden md:block' : 'block'}`}>
        <ConversationList
          onSelectConversation={handleSelectConversation}
          selectedMatchId={selectedConversation?.matchId}
        />
      </div>

      {/* Chat Window */}
      <div className={`flex-1 ${showMobileChat ? 'block' : 'hidden md:block'}`}>
        {selectedConversation ? (
          <ChatWindow
            conversation={selectedConversation}
            onClose={handleCloseMobileChat}
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500 max-w-sm">
                Choose a conversation from the sidebar to start messaging your connections
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}