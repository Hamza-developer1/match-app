import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";

interface MatchNotification {
  type: "mutual_match" | "new_like";
  match?: any;
  liker?: any;
  timestamp: string;
}

export function useSocket() {
  const { data: session } = useSession();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [matchNotifications, setMatchNotifications] = useState<
    MatchNotification[]
  >([]);

  useEffect(() => {
    console.log('useSocket useEffect triggered, session:', session?.user?.email, 'socketRef:', !!socketRef.current);
    const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    
    if (session?.user?.email && !socketRef.current && isLocalhost) {
      // Fetch WebSocket token and initialize connection
      const initializeSocket = async () => {
        try {
          console.log('Fetching WebSocket token...');
          const response = await fetch('/api/auth/websocket-token', {
            method: 'GET',
            credentials: 'include', // Include cookies for session
          });
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Token fetch failed:', response.status, errorText);
            console.error('Response headers:', Object.fromEntries(response.headers.entries()));
            throw new Error(`Failed to get WebSocket token: ${response.status} - ${errorText}`);
          }
          
          const { token } = await response.json();
          console.log('WebSocket token received, length:', token ? token.length : 'undefined');
          console.log('Token starts with:', token ? token.substring(0, 20) + '...' : 'undefined');
          
          // Initialize socket connection with proper JWT token
          socketRef.current = io(window.location.origin, {
              path: "/api/socket",
              auth: {
                token: token,
              },
              timeout: 20000,
              forceNew: true,
              transports: window.location.hostname === 'localhost' ? ['polling', 'websocket'] : ['polling'],
            }
          );
          
          setupSocketListeners();
        } catch (error) {
          console.error('Failed to initialize socket:', error);
          // Retry after a delay if this was the first attempt
          setTimeout(() => {
            if (session?.user?.email && !socketRef.current) {
              console.log('Retrying socket initialization...');
              initializeSocket();
            }
          }, 5000);
        }
      };
      
      initializeSocket();
    }

    function setupSocketListeners() {
      if (!socketRef.current) return;

      const socket = socketRef.current;

      socket.on("connect", () => {
        setIsConnected(true);
        socket.emit("user:online");
      });

      socket.on("disconnect", () => {
        setIsConnected(false);
      });

      // Listen for match notifications
      socket.on("match:new", (notification: MatchNotification) => {
        setMatchNotifications((prev) => [notification, ...prev]);

        // Show browser notification if supported
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("New Match! 🎉", {
            body: "You have a new mutual match on MatchApp!",
            icon: "/icon.svg",
          });
        }
      });

      // Listen for like notifications
      socket.on("match:like", (notification: MatchNotification) => {
        setMatchNotifications((prev) => [notification, ...prev]);

        // Show browser notification
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Someone liked you! 💙", {
            body: "Check out your new like on MatchApp!",
            icon: "/icon.svg",
          });
        }
      });

      socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        setIsConnected(false);
        
        // Don't automatically retry - let Socket.IO handle reconnection
        // The client will automatically retry with exponential backoff
      });

      // Handle reconnection events
      socket.on("reconnect", (attemptNumber) => {
        console.log(`Socket reconnected after ${attemptNumber} attempts`);
        setIsConnected(true);
      });

      socket.on("reconnect_error", (error) => {
        console.error("Socket reconnection failed:", error);
      });

      socket.on("reconnect_failed", () => {
        console.error("Socket reconnection failed permanently");
        setIsConnected(false);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
    };
  }, [session?.user?.email]);

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const clearNotifications = () => {
    setMatchNotifications([]);
  };

  const markNotificationAsRead = (index: number) => {
    setMatchNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  return {
    socket: socketRef.current,
    isConnected,
    matchNotifications,
    clearNotifications,
    markNotificationAsRead,
  };
}
