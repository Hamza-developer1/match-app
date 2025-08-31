import { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { pusherManager } from '@/lib/pusher-client';

export interface Message {
  _id: string;
  matchId: string;
  senderId: string | { _id: string; name: string; image?: string };
  receiverId: string;
  content: string;
  messageType: 'text' | 'image' | 'emoji';
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

export interface Conversation {
  matchId: string | null;
  otherUser: {
    _id: string;
    name: string;
    image?: string;
    email: string;
    lastActive?: Date;
    profile?: {
      university?: string;
      year?: number;
      major?: string;
      interests?: string[];
      bio?: string;
    };
  };
  matchedAt: Date;
  lastMessageAt?: Date;
  latestMessage?: {
    content: string;
    senderId: string;
    createdAt: Date;
    messageType: string;
  };
  unreadCount: number;
  userSeen: boolean;
  status?: 'accepted' | 'pending';
}

export interface TypingUser {
  userId: string;
  matchId: string;
  isTyping: boolean;
}

export function usePusherMessaging() {
  const { data: session } = useSession();
  const subscriberIdRef = useRef<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<{ [matchId: string]: Message[] }>({});
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch user ID from profile API
  useEffect(() => {
    if (session?.user?.email && !userId) {
      fetch('/api/profile')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user) {
            setUserId(data.user._id);
          }
        })
        .catch(error => {
          console.error('Error fetching user profile for messaging:', error);
        });
    }
  }, [session?.user?.email, userId]);

  // Initialize Pusher connection
  useEffect(() => {
    if (session?.user?.email && userId) {
      if (process.env.NODE_ENV === 'development') {
        console.log('usePusherMessaging: Connecting to Pusher for user:', userId);
      }
      
      pusherManager.connect({
        userId,
        onMessage: (data: any) => {
          console.log('📨 PUSHER MESSAGE RECEIVED:', data);
          console.log('📨 Current user ID:', userId);
          const { matchId, message, _id, senderId, content, messageType, timestamp } = data;
          
          // Use the complete message object if available, otherwise construct from data
          const messageToAdd: Message = message || {
            _id: _id || `temp-${Date.now()}`,
            matchId,
            senderId,
            receiverId: userId || '',
            content,
            messageType,
            isRead: false,
            createdAt: new Date(timestamp),
          };
          
          console.log('📨 Adding message to state:', messageToAdd);
          
          setMessages(prev => {
            const updated = {
              ...prev,
              [matchId]: [
                ...(prev[matchId] || []),
                messageToAdd
              ]
            };
            console.log('📨 Updated messages state for match', matchId, ':', updated[matchId]);
            return updated;
          });

          // Update conversation's last message
          setConversations(prev => 
            prev.map(conv => 
              conv.matchId === matchId
                ? {
                    ...conv,
                    lastMessageAt: new Date(timestamp),
                    latestMessage: {
                      content,
                      senderId,
                      createdAt: new Date(timestamp),
                      messageType
                    },
                    unreadCount: conv.unreadCount + 1
                  }
                : conv
            )
          );
        },
        onTyping: (data: any) => {
          console.log('usePusherMessaging: Typing indicator:', data);
          const { matchId, userId: typingUserId, isTyping } = data;
          
          setTypingUsers(prev => {
            const filtered = prev.filter(user => 
              !(user.userId === typingUserId && user.matchId === matchId)
            );
            
            if (isTyping) {
              return [...filtered, { userId: typingUserId, matchId, isTyping }];
            }
            
            return filtered;
          });
        },
        onReadReceipt: (data: any) => {
          console.log('usePusherMessaging: Read receipt:', data);
          const { matchId } = data;
          setMessages(prev => ({
            ...prev,
            [matchId]: (prev[matchId] || []).map(msg => ({
              ...msg,
              isRead: true,
              readAt: new Date(data.timestamp)
            }))
          }));
        }
      }).then((subId) => {
        subscriberIdRef.current = subId;
        setIsConnected(true);
      }).catch(error => {
        console.error('usePusherMessaging: Connection error:', error);
        setIsConnected(false);
      });
    }

    return () => {
      if (subscriberIdRef.current) {
        pusherManager.disconnect(subscriberIdRef.current);
        subscriberIdRef.current = null;
      }
      setIsConnected(false);
    };
  }, [session?.user?.email, userId]);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const response = await fetch('/api/messages/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  }, []);

  // Fetch messages for a specific match
  const fetchMessages = useCallback(async (matchId: string, page: number = 1) => {
    try {
      const response = await fetch(`/api/messages/${matchId}?page=${page}&limit=50`);
      if (response.ok) {
        const data = await response.json();
        setMessages(prev => ({
          ...prev,
          [matchId]: page === 1 ? data.messages : [...(prev[matchId] || []), ...data.messages]
        }));
        return data;
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, []);

  // Send a message via Pusher API
  const sendMessage = useCallback(async (matchId: string, receiverId: string, content: string, messageType: 'text' | 'image' | 'emoji' = 'text') => {
    console.log('🚀 sendMessage called:', { matchId, receiverId, content, messageType });
    console.log('🔌 Pusher connection status:', isConnected);
    
    try {
      // Send message to API first (for database storage)
      console.log('📤 Sending to /api/messages/send...');
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId,
          content,
          messageType,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Message saved to database:', data);
        
        // IMMEDIATELY add the message to sender's local state
        const newMessage = data.message;
        setMessages(prev => ({
          ...prev,
          [matchId]: [
            ...(prev[matchId] || []),
            newMessage
          ]
        }));
        console.log('✅ Message added to sender state immediately');
        
        // Send real-time message via Pusher (for receiver only)
        console.log('📡 Sending to receiver via Pusher...');
        const pusherResponse = await fetch('/api/pusher/send-message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            matchId,
            receiverId,
            content,
            messageType,
            sendToSender: false, // Don't send back to sender
          }),
        });

        if (pusherResponse.ok) {
          console.log('✅ Pusher message sent to receiver');
          return true;
        } else {
          console.error('❌ Pusher message failed:', await pusherResponse.text());
        }
      } else {
        console.error('❌ Database save failed:', await response.text());
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
    }
    
    return false;
  }, [isConnected]);

  // Send typing indicator via Pusher API
  const sendTyping = useCallback(async (matchId: string, receiverId: string, isTyping: boolean) => {
    try {
      await fetch('/api/pusher/typing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchId,
          receiverId,
          isTyping,
        }),
      });
    } catch (error) {
      console.error('Error sending typing indicator:', error);
    }
  }, []);

  // Mark messages as read via Pusher API
  const markAsRead = useCallback(async (matchId: string, senderId: string) => {
    try {
      await fetch('/api/pusher/read-receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchId,
          senderId,
        }),
      });
    } catch (error) {
      console.error('Error sending read receipt:', error);
    }
  }, []);

  return {
    isConnected,
    conversations,
    messages,
    typingUsers,
    fetchConversations,
    fetchMessages,
    sendMessage,
    sendTyping,
    markAsRead,
  };
}