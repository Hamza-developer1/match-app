'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import MessagingLayout from '../../components/MessagingLayout';
import { useUserActivity } from '../../hooks/useUserActivity';

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Update user activity (last seen timestamp)
  useUserActivity();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="h-screen">
      <MessagingLayout />
    </div>
  );
}