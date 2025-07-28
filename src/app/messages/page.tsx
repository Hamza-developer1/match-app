'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MatchNotification from '../../components/MatchNotification';
import { useSocket } from '../../hooks/useSocket';

interface Match {
  id: string;
  matchedAt: string;
  lastMessageAt?: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
    profile?: {
      university?: string;
      major?: string;
      year?: number;
    };
  };
  seen: boolean;
}

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { isConnected } = useSocket();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchMatches();
    }
  }, [status, router, mounted]);

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/matches');
      const data = await response.json();
      
      if (response.ok) {
        setMatches(data.matches);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!mounted || status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-4 h-4 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.1s]"></div>
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="w-full p-6 flex justify-between items-center backdrop-blur-sm bg-white/80 border-b border-gray-100 sticky top-0 z-40">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">🎓</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            MatchApp
          </h1>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link href="/discover" className="text-gray-600 hover:text-gray-800 transition-colors">
            Discover
          </Link>
          <Link href="/profile" className="text-gray-600 hover:text-gray-800 transition-colors">
            Profile
          </Link>
        </div>
      </header>

      {/* Real-time Match Notifications */}
      <MatchNotification onMatchesUpdate={fetchMatches} />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Matches</h1>
            <p className="text-gray-600">Connect with your study buddies</p>
          </div>
          
          {/* Connection Status */}
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-500">
              {isConnected ? 'Connected' : 'Connecting...'}
            </span>
          </div>
        </div>

        {matches.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => (
              <div
                key={match.id}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Profile Image */}
                <div className="relative h-48 bg-gradient-to-br from-blue-400 to-indigo-500">
                  {match.user.image ? (
                    <img
                      src={match.user.image}
                      alt={match.user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-white text-3xl font-bold">
                          {match.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* New match indicator */}
                  {!match.seen && (
                    <div className="absolute top-3 right-3">
                      <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                        New!
                      </div>
                    </div>
                  )}
                </div>

                {/* Match Info */}
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">
                      {match.user.name}
                    </h3>
                    <div className="flex items-center text-gray-600 text-sm space-x-2">
                      {match.user.profile?.university && (
                        <span className="flex items-center">
                          <span className="mr-1">🏫</span>
                          {match.user.profile.university}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Academic Info */}
                  {match.user.profile?.major && (
                    <div className="mb-4">
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        <span className="mr-1">🎓</span>
                        {match.user.profile.major}
                      </div>
                    </div>
                  )}

                  {/* Match Date */}
                  <div className="text-sm text-gray-500 mb-4">
                    Matched {formatDate(match.matchedAt)}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 text-sm font-semibold">
                      Message
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm font-semibold">
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-6">💙</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No matches yet</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start discovering students who share your interests to find your first match!
            </p>
            <Link
              href="/discover"
              className="inline-block px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-semibold"
            >
              Start Discovering
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}