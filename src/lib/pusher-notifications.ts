import { pusher, CHANNELS, EVENTS } from './pusher';

// Function to emit match notifications via Pusher
export function emitMatchNotification(userId1: string, userId2: string, matchData: any) {
  const notificationData = {
    type: 'mutual_match',
    match: matchData,
    timestamp: new Date().toISOString()
  };

  // Notify both users about the mutual match
  pusher.trigger(CHANNELS.USER(userId1), EVENTS.MATCH_NEW, notificationData);
  pusher.trigger(CHANNELS.USER(userId2), EVENTS.MATCH_NEW, notificationData);

  console.log(`Match notification sent to users ${userId1} and ${userId2} via Pusher`);
}

// Function to emit when someone likes you (but not yet mutual)
export function emitLikeNotification(targetUserId: string, likerData: any) {
  const notificationData = {
    type: 'new_like',
    liker: likerData,
    timestamp: new Date().toISOString()
  };

  pusher.trigger(CHANNELS.USER(targetUserId), EVENTS.MATCH_LIKE, notificationData);

  console.log(`Like notification sent to user ${targetUserId} via Pusher`);
}

// Function to emit user status updates
export function emitUserStatusUpdate(userId: string, status: 'online' | 'offline') {
  pusher.trigger(`presence-users`, EVENTS.USER_STATUS, {
    userId,
    status,
    timestamp: new Date().toISOString()
  });

  console.log(`User status update sent for user ${userId}: ${status}`);
}