'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MatchingCard from '../../components/MatchingCard';
import MatchNotification from '../../components/MatchNotification';
import { useSocket } from '../../hooks/useSocket';

interface UserProfile {
  _id: string;
  email: string;
  name: string;
  image?: string;
  profile?: {
    university?: string;
    year?: number;
    major?: string;
    interests?: string[];
    bio?: string;
  };
}

export default function DiscoverPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { socket, isConnected, matchNotifications } = useSocket();

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
      fetchUsers();
    }
  }, [status, router, mounted]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/discover');
      const data = await response.json();
      
      if (response.ok) {
        setUsers(data.users);
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: 'like' | 'reject' | 'skip') => {
    if (currentIndex >= users.length || actionLoading) return;

    setActionLoading(true);
    const currentUser = users[currentIndex];

    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUserId: currentUser._id,
          action,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Move to next user
        if (currentIndex + 1 >= users.length) {
          // Fetch more users if we've reached the end
          await fetchUsers();
        } else {
          setCurrentIndex(currentIndex + 1);
        }
      }
    } catch (error) {
      console.error('Error performing action:', error);
    } finally {
      setActionLoading(false);
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

  const currentUser = users[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="w-full p-6 flex justify-between items-center backdrop-blur-sm bg-white/80 border-b border-gray-100">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">🎓</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            MatchApp
          </h1>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link href="/profile" className="text-gray-600 hover:text-gray-800">
            Profile
          </Link>
        </div>
      </header>

      {/* Real-time Match Notifications */}
      <MatchNotification onMatchesUpdate={() => {}} />

      <div className="max-w-md mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Find Study Buddies</h1>
          <p className="text-gray-600">Discover students who share your interests</p>
          
          {/* Connection Status */}
          <div className="flex items-center justify-center mt-4">
            <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-500">
              {isConnected ? 'Connected' : 'Connecting...'}
            </span>
          </div>
        </div>

        {currentUser ? (
          <MatchingCard
            user={currentUser}
            onAction={handleAction}
            isLoading={actionLoading}
          />
        ) : (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">🎓</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No more profiles!</h2>
            <p className="text-gray-600 mb-6">Check back later for more study buddies</p>
            <Link
              href="/"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
            >
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}