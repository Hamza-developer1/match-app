import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

export function useUserActivity() {
  const { data: session, status } = useSession();
  const lastUpdateRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const updateActivity = async () => {
    if (!session?.user?.email) return;

    const now = Date.now();
    // Only update if it's been more than 1 minute since last update
    if (now - lastUpdateRef.current < 60000) return;

    try {
      const response = await fetch('/api/user/update-activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        lastUpdateRef.current = now;
      }
    } catch (error) {
      // Silently handle activity update errors
    }
  };

  useEffect(() => {
    if (status === "loading" || !session?.user?.email) return;

    // Update activity immediately when session is available
    updateActivity();

    // Set up periodic updates while user is active
    intervalRef.current = setInterval(updateActivity, 60000); // Update every minute

    // Update activity on visibility change (when user comes back to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateActivity();
      }
    };

    // Update activity on focus (when user clicks back into the app)
    const handleFocus = () => {
      updateActivity();
    };

    // Update activity on user interaction (mouse move, key press, etc.)
    const handleUserInteraction = () => {
      updateActivity();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    // Throttle interaction events to prevent excessive API calls
    let interactionThrottle: NodeJS.Timeout | null = null;
    const throttledInteraction = () => {
      if (interactionThrottle) return;
      interactionThrottle = setTimeout(() => {
        handleUserInteraction();
        interactionThrottle = null;
      }, 30000); // Throttle to once per 30 seconds
    };

    document.addEventListener('mousemove', throttledInteraction);
    document.addEventListener('keydown', throttledInteraction);
    document.addEventListener('click', throttledInteraction);
    document.addEventListener('scroll', throttledInteraction);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (interactionThrottle) {
        clearTimeout(interactionThrottle);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('mousemove', throttledInteraction);
      document.removeEventListener('keydown', throttledInteraction);
      document.removeEventListener('click', throttledInteraction);
      document.removeEventListener('scroll', throttledInteraction);
    };
  }, [session, status]);

  return null;
}