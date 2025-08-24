import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import io, { Socket } from 'socket.io-client';

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
  matchId: string;
  otherUser: {
    _id: string;
    name: string;
    image?: string;
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
}

export interface TypingUser {
  userId: string;
  matchId: string;
  isTyping: boolean;
}

export function useMessaging() {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<{ [matchId: string]: Message[] }>({});
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  // Initialize socket connection
  useEffect(() => {
    if (session?.user?.email && !socket) {
      const initializeSocket = async () => {
        try {
          console.log('useMessaging: Fetching WebSocket token...');
          const response = await fetch('/api/auth/websocket-token', {
            method: 'GET',
            credentials: 'include',
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('useMessaging: Token fetch failed:', response.status, errorText);
            return;
          }
          
          const { token } = await response.json();
          console.log('useMessaging: Token received, connecting...');
          
          const newSocket = io("http://localhost:3000", {
            path: '/api/socket',
            auth: {
              token: token,
            },
          });

          newSocket.on('connect', () => {
            console.log('useMessaging: Socket connected');
            setIsConnected(true);
            newSocket.emit('user:online');
          });

          newSocket.on('disconnect', () => {
            console.log('useMessaging: Socket disconnected');
            setIsConnected(false);
          });

          newSocket.on('connect_error', (error) => {
            console.error('useMessaging: Socket connection error:', error);
            setIsConnected(false);
          });

      // Handle incoming messages
      newSocket.on('message:receive', (data) => {
        const { matchId, senderId, content, messageType, timestamp } = data;
        
        setMessages(prev => ({
          ...prev,
          [matchId]: [
            ...(prev[matchId] || []),
            {
              _id: `temp-${Date.now()}`,
              matchId,
              senderId,
              receiverId: session.user?.email || '',
              content,
              messageType,
              isRead: false,
              createdAt: new Date(timestamp),
            } as Message
          ]
        }));

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
      });

      // Handle message confirmations
      newSocket.on('message:sent', (data) => {
        // Message sent successfully
      });

      // Handle typing indicators
      newSocket.on('typing:user_typing', (data) => {
        const { matchId, userId, isTyping } = data;
        
        setTypingUsers(prev => {
          const filtered = prev.filter(user => 
            !(user.userId === userId && user.matchId === matchId)
          );
          
          if (isTyping) {
            return [...filtered, { userId, matchId, isTyping }];
          }
          
          return filtered;
        });
      });

      // Handle read receipts
      newSocket.on('message:read_receipt', (data) => {
        const { matchId } = data;
        setMessages(prev => ({
          ...prev,
          [matchId]: (prev[matchId] || []).map(msg => ({
            ...msg,
            isRead: true,
            readAt: new Date(data.timestamp)
          }))
        }));
      });

          setSocket(newSocket);
        } catch (error) {
          console.error('useMessaging: Failed to initialize socket:', error);
        }
      };
      
      initializeSocket();

      return () => {
        if (socket) {
          socket.close();
        }
      };
    }
  }, [session?.user?.email]);

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

  // Send a message
  const sendMessage = useCallback(async (matchId: string, receiverId: string, content: string, messageType: 'text' | 'image' | 'emoji' = 'text') => {
    if (!socket || !isConnected) {
      console.error('Socket not connected');
      return false;
    }

    try {
      // Send via API first
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
        
        // Then emit via socket for real-time delivery
        socket.emit('message:send', {
          matchId,
          receiverId,
          content,
          messageType,
        });

        // Add to local state
        setMessages(prev => ({
          ...prev,
          [matchId]: [
            ...(prev[matchId] || []),
            data.message
          ]
        }));

        return true;
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
    
    return false;
  }, [socket, isConnected]);

  // Send typing indicator
  const sendTyping = useCallback((matchId: string, receiverId: string, isTyping: boolean) => {
    if (socket && isConnected) {
      socket.emit(isTyping ? 'typing:start' : 'typing:stop', {
        matchId,
        receiverId,
      });
    }
  }, [socket, isConnected]);

  // Mark messages as read
  const markAsRead = useCallback((matchId: string, senderId: string) => {
    if (socket && isConnected) {
      socket.emit('message:mark_read', {
        matchId,
        senderId,
      });
    }
  }, [socket, isConnected]);

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