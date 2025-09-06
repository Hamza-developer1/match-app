'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ConnectionsPage() {
  const { data: session, status } = useSession();
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);


  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      return;
    }

    fetchConnections();
  }, [session, status]);

  const fetchConnections = async () => {
    try {
      const response = await fetch('/api/messages/conversations');
      
      if (response.ok) {
        const data = await response.json();
        setConnections(data.conversations || []);
      } else {
        setError(`API Error: ${response.status}`);
      }
    } catch (error) {
      setError(`Fetch Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (user: any) => {
    setSelectedProfile(user);
    setShowProfileModal(true);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Session Loading...</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Not Authenticated</h1>
          <Link href="/auth/signin" className="text-blue-600 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading Connections...</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Fetching your connections...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
          <div className="flex items-center mb-4">
            <Link 
              href="/" 
              className="mr-2 sm:mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Back to Home"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">🤝 Your Connections</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">{connections.length} connections found</p>
            </div>
          </div>
          {error && <p className="text-red-600 text-sm"><strong>Error:</strong> {error}</p>}
        </div>

        {connections.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 sm:p-8 text-center">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">No Connections Yet</h2>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">You haven't connected with anyone yet. Start discovering people!</p>
            <Link
              href="/discover"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              Discover People
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <strong className="text-sm sm:text-base">Your Network</strong>
                  <p className="text-xs sm:text-sm mt-1">
                    {connections.filter(c => c.status === 'accepted').length} connected • {connections.filter(c => c.status === 'pending').length} pending
                  </p>
                </div>
                <div className="flex items-center space-x-3 sm:space-x-4 text-xs sm:text-sm">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Connected</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span>Pending</span>
                  </div>
                </div>
              </div>
            </div>
            
            {connections.map((connection, index) => (
              <div key={connection.matchId || connection.otherUser._id || index} className="bg-white rounded-lg shadow p-4 border-l-4 border-l-gray-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Status Indicator */}
                  <div className="relative flex-shrink-0">
                    {connection.otherUser?.image ? (
                      <img
                        src={connection.otherUser.image}
                        alt={connection.otherUser.name}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm sm:text-base">
                          {(connection.otherUser?.name || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    {/* Status Badge */}
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-white flex items-center justify-center ${
                      connection.status === 'accepted' 
                        ? 'bg-green-500' 
                        : 'bg-yellow-500'
                    }`}>
                      <span className="text-white text-xs font-bold">
                        {connection.status === 'accepted' ? '✓' : '⏳'}
                      </span>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <h3 className="font-semibold text-base sm:text-lg text-black truncate">
                        {connection.otherUser?.name || 'Unknown User'}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full self-start ${
                        connection.status === 'accepted'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {connection.status === 'accepted' ? 'Connected' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm truncate">
                      {connection.otherUser?.email || 'No email'}
                    </p>
                    {connection.otherUser?.profile && (
                      <p className="text-xs sm:text-sm text-gray-500 truncate">
                        {connection.otherUser.profile.university} • {connection.otherUser.profile.major}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => handleViewProfile(connection.otherUser)}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm text-center"
                    >
                      View Profile
                    </button>
                    {connection.status === 'accepted' && connection.matchId && (
                      <Link
                        href="/messages"
                        className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm text-center"
                      >
                        Message
                      </Link>
                    )}
                    {connection.status === 'pending' && (
                      <span className="px-3 py-2 bg-yellow-100 text-yellow-700 rounded text-xs text-center">
                        Waiting for response
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Profile Modal */}
      {showProfileModal && selectedProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowProfileModal(false)}>
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-md max-h-[90vh] sm:max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Profile</h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl p-1"
              >
                ×
              </button>
            </div>
            
            {/* Profile Content */}
            <div className="text-center mb-4 sm:mb-6">
              {selectedProfile.image ? (
                <img
                  src={selectedProfile.image}
                  alt={selectedProfile.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover mx-auto mb-3"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-semibold text-lg sm:text-xl">
                    {selectedProfile.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 break-words">{selectedProfile.name}</h4>
              <p className="text-gray-600 mb-4 text-sm break-all">{selectedProfile.email}</p>
            </div>

            {/* Profile Details */}
            {selectedProfile.profile && (
              <div className="space-y-3 sm:space-y-4">
                {selectedProfile.profile.university && (
                  <div>
                    <h5 className="font-medium text-gray-700 mb-1 text-sm sm:text-base">University</h5>
                    <p className="text-gray-600 text-sm sm:text-base break-words">{selectedProfile.profile.university}</p>
                  </div>
                )}
                
                {selectedProfile.profile.major && (
                  <div>
                    <h5 className="font-medium text-gray-700 mb-1 text-sm sm:text-base">Major</h5>
                    <p className="text-gray-600 text-sm sm:text-base break-words">{selectedProfile.profile.major}</p>
                  </div>
                )}
                
                {selectedProfile.profile.year && (
                  <div>
                    <h5 className="font-medium text-gray-700 mb-1 text-sm sm:text-base">Year</h5>
                    <p className="text-gray-600 text-sm sm:text-base">
                      {selectedProfile.profile.year === 1 ? 'Freshman' :
                       selectedProfile.profile.year === 2 ? 'Sophomore' :
                       selectedProfile.profile.year === 3 ? 'Junior' :
                       selectedProfile.profile.year === 4 ? 'Senior' :
                       selectedProfile.profile.year === 5 ? 'Graduate' : 'PhD'}
                    </p>
                  </div>
                )}
                
                <div>
                  <h5 className="font-medium text-gray-700 mb-2 text-sm sm:text-base">Interests</h5>
                  {selectedProfile.profile.interests && selectedProfile.profile.interests.length > 0 ? (
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {selectedProfile.profile.interests.map((interest: string, index: number) => (
                        <span key={index} className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm break-words">
                          {interest}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic text-xs sm:text-sm">No interests listed</p>
                  )}
                </div>
                
                {selectedProfile.profile.bio && (
                  <div>
                    <h5 className="font-medium text-gray-700 mb-1 text-sm sm:text-base">Bio</h5>
                    <p className="text-gray-600 text-sm sm:text-base break-words">{selectedProfile.profile.bio}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}