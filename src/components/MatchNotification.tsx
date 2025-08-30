'use client';

import { useEffect, useState } from 'react';
import { usePusher } from '../hooks/usePusher';

interface MatchNotificationProps {
  onMatchesUpdate?: () => void;
}

export default function MatchNotification({ onMatchesUpdate }: MatchNotificationProps) {
  const { matchNotifications, markNotificationAsRead } = usePusher();
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (matchNotifications.length > 0) {
      setShowNotifications(true);
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setShowNotifications(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [matchNotifications]);

  if (!showNotifications || matchNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 space-y-3">
      {matchNotifications.slice(0, 3).map((notification, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm transform transition-all duration-300 animate-slide-in-right"
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {notification.type === 'mutual_match' ? (
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">🎉</span>
                </div>
              ) : (
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">✅</span>
                </div>
              )}
            </div>
            
            <div className="ml-3 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-900">
                  {notification.type === 'mutual_match' ? "It's a Connection! 🎉" : "New Interest! ✅"}
                </h4>
                <button
                  onClick={() => markNotificationAsRead(index)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="text-lg">×</span>
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mt-1">
                {notification.type === 'mutual_match' 
                  ? `You and ${notification.match?.user?.name || 'someone'} are now connected!`
                  : `${notification.liker?.name || 'Someone'} is interested in connecting!`
                }
              </p>
              
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={() => {
                    markNotificationAsRead(index);
                    onMatchesUpdate?.();
                    // Navigate to matches or messages
                    window.location.href = notification.type === 'mutual_match' ? '/messages' : '/discover';
                  }}
                  className="px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {notification.type === 'mutual_match' ? 'View Connection' : 'See Profile'}
                </button>
                <button
                  onClick={() => markNotificationAsRead(index)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {matchNotifications.length > 3 && (
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <p className="text-sm text-blue-700">
            +{matchNotifications.length - 3} more notifications
          </p>
        </div>
      )}
    </div>
  );
}