import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { pusherManager } from '@/lib/pusher-client';

interface MatchNotification {
  type: "mutual_match" | "new_like";
  match?: any;
  liker?: any;
  timestamp: string;
}

export function usePusher() {
  const { data: session } = useSession();
  const subscriberIdRef = useRef<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [matchNotifications, setMatchNotifications] = useState<MatchNotification[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch user ID from profile API
  useEffect(() => {
    if (session?.user?.email && !userId) {
      fetch('/api/profile')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user) {
            console.log('Fetched user ID:', data.user._id);
            setUserId(data.user._id);
          }
        })
        .catch(error => {
          console.error('Error fetching user profile:', error);
        });
    }
  }, [session?.user?.email, userId]);

  useEffect(() => {
    if (session?.user?.email && userId) {
      if (process.env.NODE_ENV === 'development') {
        console.log('usePusher: Connecting to Pusher for user:', userId);
      }
      
      pusherManager.connect({
        userId,
        onMatch: (notification: MatchNotification) => {
          console.log('New match notification:', notification);
          setMatchNotifications((prev) => [notification, ...prev]);

          // Show browser notification if supported
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("New Connection! 🎉", {
              body: "You have a new mutual connection on Campus Connect!",
              icon: "/icon.svg",
            });
          }
        },
        onLike: (notification: MatchNotification) => {
          console.log('New like notification:', notification);
          setMatchNotifications((prev) => [notification, ...prev]);

          // Show browser notification
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Someone is interested! ✅", {
              body: "Check out your new connection interest on Campus Connect!",
              icon: "/icon.svg",
            });
          }
        }
      }).then((subId) => {
        subscriberIdRef.current = subId;
        setIsConnected(true);
      }).catch(error => {
        console.error('usePusher: Connection error:', error);
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
    isConnected,
    matchNotifications,
    clearNotifications,
    markNotificationAsRead,
  };
}