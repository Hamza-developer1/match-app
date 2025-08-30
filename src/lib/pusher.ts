import Pusher from 'pusher';
import PusherClient from 'pusher-js';

// Server-side Pusher instance
export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_APP_KEY!,
  secret: process.env.PUSHER_APP_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

// Client-side Pusher instance creator
export const createPusherClient = () => {
  return new PusherClient(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    forceTLS: true,
    enabledTransports: ['ws', 'wss'],
    disableStats: true,
  });
};

// Channel names
export const CHANNELS = {
  USER: (userId: string) => `user-${userId}`,
  MATCH: (matchId: string) => `match-${matchId}`,
} as const;

// Event names
export const EVENTS = {
  MESSAGE_SEND: 'message:send',
  MESSAGE_RECEIVE: 'message:receive',
  MESSAGE_SENT: 'message:sent',
  MESSAGE_ERROR: 'message:error',
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',
  TYPING_USER_TYPING: 'typing:user_typing',
  MESSAGE_MARK_READ: 'message:mark_read',
  MESSAGE_READ_RECEIPT: 'message:read_receipt',
  MATCH_NEW: 'match:new',
  MATCH_LIKE: 'match:like',
  USER_STATUS: 'user:status',
} as const;