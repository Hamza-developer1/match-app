'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MatchingCard from '../../components/MatchingCard';
import MatchNotification from '../../components/MatchNotification';
import { usePusher } from '../../hooks/usePusher';
import { useUserActivity } from '../../hooks/useUserActivity';

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
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    university: '',
    major: '',
    year: '',
    interest: ''
  });
  const { pusher, isConnected, matchNotifications } = usePusher();
  
  // Update user activity (last seen timestamp)
  useUserActivity();

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
      const queryParams = new URLSearchParams();
      if (filters.university) queryParams.append('university', filters.university);
      if (filters.major) queryParams.append('major', filters.major);
      if (filters.year) queryParams.append('year', filters.year);
      if (filters.interest) queryParams.append('interest', filters.interest);
      
      const url = `/api/discover${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url);
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

  const applyFilters = () => {
    setLoading(true);
    fetchUsers();
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      university: '',
      major: '',
      year: '',
      interest: ''
    });
    setLoading(true);
    fetchUsers();
    setShowFilters(false);
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
            Campus Connect
          </h1>
        </Link>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
            Filters
          </button>
          <Link href="/profile" className="text-gray-600 hover:text-gray-800">
            Profile
          </Link>
        </div>
      </header>

      {/* Real-time Match Notifications */}
      <MatchNotification onMatchesUpdate={() => {}} />

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-2xl mx-auto px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
                <input
                  type="text"
                  value={filters.university}
                  onChange={(e) => setFilters({...filters, university: e.target.value})}
                  placeholder="e.g., Stanford, MIT"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Major</label>
                <input
                  type="text"
                  value={filters.major}
                  onChange={(e) => setFilters({...filters, major: e.target.value})}
                  placeholder="e.g., Computer Science, Biology"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <select
                  value={filters.year}
                  onChange={(e) => setFilters({...filters, year: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="">Any year</option>
                  <option value="1">Freshman</option>
                  <option value="2">Sophomore</option>
                  <option value="3">Junior</option>
                  <option value="4">Senior</option>
                  <option value="5">Graduate</option>
                  <option value="6">PhD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interest</label>
                <input
                  type="text"
                  value={filters.interest}
                  onChange={(e) => setFilters({...filters, interest: e.target.value})}
                  placeholder="e.g., Math, Music, Sports"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Find Study Buddies</h1>
          <p className="text-gray-600">Discover students who share your interests</p>
          
          {/* Connection Status - Only show if there are connection issues */}
          {!isConnected && (
            <div className="flex items-center justify-center mt-4">
              <div className="w-2 h-2 rounded-full mr-2 bg-yellow-500"></div>
              <span className="text-xs text-gray-500">
                Real-time features connecting...
              </span>
            </div>
          )}
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