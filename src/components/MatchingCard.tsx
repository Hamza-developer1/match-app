'use client';

import { useState } from 'react';
import { useSocket } from '../hooks/useSocket';

interface User {
  _id: string;
  name: string;
  email: string;
  image?: string;
  profile?: {
    university?: string;
    year?: number;
    major?: string;
    interests?: string[];
    bio?: string;
  };
}

interface MatchingCardProps {
  user: User;
  onAction: (action: 'like' | 'reject' | 'skip') => Promise<void>;
  isLoading?: boolean;
}

export default function MatchingCard({ user, onAction, isLoading }: MatchingCardProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { socket } = useSocket();

  const handleAction = async (action: 'like' | 'reject' | 'skip') => {
    if (isLoading || actionLoading) return;
    
    setActionLoading(action);
    try {
      await onAction(action);
    } finally {
      setActionLoading(null);
    }
  };

  const getYearText = (year?: number) => {
    if (!year) return '';
    const yearNames = {
      1: 'Freshman',
      2: 'Sophomore', 
      3: 'Junior',
      4: 'Senior',
      5: 'Graduate',
      6: 'PhD'
    };
    return yearNames[year as keyof typeof yearNames] || `Year ${year}`;
  };

  return (
    <div className="max-w-sm mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-105">
      {/* Profile Image */}
      <div className="relative h-80 bg-gradient-to-br from-blue-400 to-indigo-500">
        {user.image ? (
          <img
            src={user.image}
            alt={user.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-6xl text-white">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        )}
        
        {/* Online indicator */}
        <div className="absolute top-4 right-4">
          <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            {user.name}
          </h2>
          <div className="flex items-center text-gray-600 text-sm space-x-2">
            {user.profile?.university && (
              <span className="flex items-center">
                <span className="mr-1">🏫</span>
                {user.profile.university}
              </span>
            )}
            {user.profile?.year && (
              <span className="flex items-center">
                <span className="mr-1">📚</span>
                {getYearText(user.profile.year)}
              </span>
            )}
          </div>
        </div>

        {/* Major */}
        {user.profile?.major && (
          <div className="mb-4">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              <span className="mr-1">🎓</span>
              {user.profile.major}
            </div>
          </div>
        )}

        {/* Bio */}
        {user.profile?.bio && (
          <div className="mb-4">
            <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
              {user.profile.bio}
            </p>
          </div>
        )}

        {/* Interests */}
        {user.profile?.interests && user.profile.interests.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-800 mb-2">Interests</h4>
            <div className="flex flex-wrap gap-2">
              {user.profile.interests.slice(0, 4).map((interest, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  {interest}
                </span>
              ))}
              {user.profile.interests.length > 4 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                  +{user.profile.interests.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          {/* Reject */}
          <button
            onClick={() => handleAction('reject')}
            disabled={isLoading || actionLoading !== null}
            className="w-14 h-14 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 active:scale-95 shadow-lg"
          >
            {actionLoading === 'reject' ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span className="text-xl">✕</span>
            )}
          </button>

          {/* Skip */}
          <button
            onClick={() => handleAction('skip')}
            disabled={isLoading || actionLoading !== null}
            className="w-14 h-14 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 active:scale-95 shadow-lg"
          >
            {actionLoading === 'skip' ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span className="text-xl">⏭</span>
            )}
          </button>

          {/* Like */}
          <button
            onClick={() => handleAction('like')}
            disabled={isLoading || actionLoading !== null}
            className="w-14 h-14 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 active:scale-95 shadow-lg"
          >
            {actionLoading === 'like' ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span className="text-xl">💙</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}