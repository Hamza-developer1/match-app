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
    if (session?.user?.email && !socketRef.current) {
      // Initialize socket connection
      socketRef.current = io(
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        {
          path: "/api/socket",
          auth: {
            token: session.user.email, // In production, use proper JWT
          },
        }
      );

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
            icon: "/favicon.ico",
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
            icon: "/favicon.ico",
          });
        }
      });

      socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
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
