import { Server as SocketIOServer } from 'socket.io';
import { NextApiRequest } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { verifyWebSocketToken } from './websocket-auth';
import User from '../models/User';
import MutualMatch from '../models/MutualMatch';
import connectToDatabase from '@/lib/mongodb';

interface ExtendedNextApiRequest extends NextApiRequest {
  socket: NextApiRequest['socket'] & {
    server: {
      io?: SocketIOServer;
    };
  };
}

export interface AuthenticatedSocket {
  userId: string;
  userEmail: string;
}

const connectedUsers = new Map<string, string>(); // userId -> socketId

export async function initializeWebSocket(req: ExtendedNextApiRequest, res: any) {
  try {
    console.log('WebSocket handler called, method:', req.method, 'path:', req.url);
    
    if (!req.socket.server.io) {
      console.log('Initializing Socket.IO server...');
    
    const io = new SocketIOServer(req.socket.server as any, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['polling', 'websocket'],
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    // Authentication middleware
    io.use(async (socket, next) => {
      try {
        console.log('=== SOCKET AUTH START ===');
        const token = socket.handshake.auth.token;
        console.log('Socket authentication attempt for IP:', socket.handshake.address);
        console.log('Received token:', token ? 'Token present (length: ' + token.length + ')' : 'No token');
        
        if (!token) {
          console.log('Socket authentication failed: No token provided');
          return next(new Error('Authentication token required'));
        }

        console.log('Attempting to verify token...');
        // Verify JWT token
        const decoded = verifyWebSocketToken(token);
        console.log('Token decoded for user:', decoded.email, 'userId:', decoded.userId);
        
        // Ensure database connection is established
        console.log('Socket auth: Connecting to database...');
        await connectToDatabase();
        console.log('Socket auth: Database connected, finding user...');
        
        // Verify user exists and token is valid
        const user = await User.findById(decoded.userId)
          .maxTimeMS(10000)
          .lean()
          .exec();
        
        if (!user) {
          console.log(`Socket authentication failed: User not found for ID: ${decoded.userId}`);
          return next(new Error('User not found'));
        }
        
        if (user.email !== decoded.email) {
          console.log(`Socket authentication failed: Email mismatch. DB: ${user.email}, Token: ${decoded.email}`);
          return next(new Error('Invalid user credentials'));
        }

        (socket as any).userId = decoded.userId;
        (socket as any).userEmail = decoded.email;
        console.log(`Socket authenticated successfully for user: ${decoded.email}`);
        console.log('=== SOCKET AUTH SUCCESS ===');
        next();
      } catch (error) {
        console.error('=== SOCKET AUTH ERROR ===');
        console.error('Socket authentication error:', error);
        if (error instanceof Error) {
          console.error('Error name:', error.name);
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
        }
        console.error('=== END SOCKET AUTH ERROR ===');
        return next(new Error(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    });

    io.on('connection', (socket) => {
      try {
        console.log('=== NEW SOCKET CONNECTION ===');
        const userId = (socket as any).userId;
        const userEmail = (socket as any).userEmail;
        console.log('Connection attempt for userId:', userId, 'email:', userEmail);
        
        if (!userId || !userEmail) {
          console.error('Socket connection without proper authentication data');
          socket.disconnect();
          return;
        }
      
      console.log(`User ${userEmail} connected with socket ${socket.id}`);
      
      // Store the connection
      connectedUsers.set(userId, socket.id);

      // Join a room specific to this user
      socket.join(`user:${userId}`);

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User ${userEmail} disconnected`);
        connectedUsers.delete(userId);
      });

      // Handle user going online/offline
      socket.on('user:online', () => {
        socket.broadcast.emit('user:status', { userId, status: 'online' });
      });

      // Handle sending messages
      socket.on('message:send', async (data) => {
        try {
          const { matchId, receiverId, content, messageType = 'text' } = data;
          
          if (!matchId || !receiverId || !content) {
            socket.emit('message:error', { error: 'Missing required fields' });
            return;
          }

          // Verify that both users have a mutual match
          const mutualMatch = await (MutualMatch as any).findMatch(userId, receiverId);
          if (!mutualMatch) {
            socket.emit('message:error', { error: 'Cannot send message - no mutual match exists' });
            return;
          }

          // Verify that the provided matchId corresponds to the actual mutual match
          if (mutualMatch._id.toString() !== matchId) {
            socket.emit('message:error', { error: 'Invalid match ID' });
            return;
          }

          // Emit the message to the receiver
          socket.to(`user:${receiverId}`).emit('message:receive', {
            matchId,
            senderId: userId,
            content,
            messageType,
            timestamp: new Date().toISOString()
          });

          // Confirm message sent to sender
          socket.emit('message:sent', {
            matchId,
            receiverId,
            timestamp: new Date().toISOString()
          });

        } catch (error) {
          console.error('Error handling message send:', error);
          socket.emit('message:error', { error: 'Failed to send message' });
        }
      });

      // Handle typing indicators
      socket.on('typing:start', async (data) => {
        try {
          const { matchId, receiverId } = data;
          
          if (!matchId || !receiverId) {
            return; // Silently ignore invalid typing indicators
          }

          // Verify that both users have a mutual match
          const mutualMatch = await (MutualMatch as any).findMatch(userId, receiverId);
          if (!mutualMatch || mutualMatch._id.toString() !== matchId) {
            return; // Silently ignore unauthorized typing indicators
          }

          socket.to(`user:${receiverId}`).emit('typing:user_typing', {
            matchId,
            userId,
            isTyping: true
          });
        } catch (error) {
          console.error('Error handling typing start:', error);
          // Silently ignore errors in typing indicators
        }
      });

      socket.on('typing:stop', async (data) => {
        try {
          const { matchId, receiverId } = data;
          
          if (!matchId || !receiverId) {
            return; // Silently ignore invalid typing indicators
          }

          // Verify that both users have a mutual match
          const mutualMatch = await (MutualMatch as any).findMatch(userId, receiverId);
          if (!mutualMatch || mutualMatch._id.toString() !== matchId) {
            return; // Silently ignore unauthorized typing indicators
          }

          socket.to(`user:${receiverId}`).emit('typing:user_typing', {
            matchId,
            userId,
            isTyping: false
          });
        } catch (error) {
          console.error('Error handling typing stop:', error);
          // Silently ignore errors in typing indicators
        }
      });

      // Handle message read receipts
      socket.on('message:mark_read', async (data) => {
        try {
          const { matchId, senderId } = data;
          
          if (!matchId || !senderId) {
            return; // Silently ignore invalid read receipts
          }

          // Verify that both users have a mutual match
          const mutualMatch = await (MutualMatch as any).findMatch(userId, senderId);
          if (!mutualMatch || mutualMatch._id.toString() !== matchId) {
            return; // Silently ignore unauthorized read receipts
          }

          socket.to(`user:${senderId}`).emit('message:read_receipt', {
            matchId,
            readByUserId: userId,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Error handling message read receipt:', error);
          // Silently ignore errors in read receipts
        }
      });
      } catch (error) {
        console.error('=== CONNECTION HANDLER ERROR ===');
        console.error('Error in connection handler:', error);
        console.error('=== END CONNECTION HANDLER ERROR ===');
        socket.disconnect();
      }
    });

    req.socket.server.io = io;
  }
  
  res.end();
  } catch (error) {
    console.error('WebSocket initialization error:', error);
    res.status(500).end();
  }
}

// Function to emit match notifications
export function emitMatchNotification(io: SocketIOServer, userId1: string, userId2: string, matchData: any) {
  // Notify both users about the mutual match
  io.to(`user:${userId1}`).emit('match:new', {
    type: 'mutual_match',
    match: matchData,
    timestamp: new Date().toISOString()
  });

  io.to(`user:${userId2}`).emit('match:new', {
    type: 'mutual_match', 
    match: matchData,
    timestamp: new Date().toISOString()
  });

  console.log(`Match notification sent to users ${userId1} and ${userId2}`);
}

// Function to emit when someone likes you (but not yet mutual)
export function emitLikeNotification(io: SocketIOServer, targetUserId: string, likerData: any) {
  io.to(`user:${targetUserId}`).emit('match:like', {
    type: 'new_like',
    liker: likerData,
    timestamp: new Date().toISOString()
  });

  console.log(`Like notification sent to user ${targetUserId}`);
}

// Get connected users
export function getConnectedUsers() {
  return Array.from(connectedUsers.keys());
}

// Check if user is online
export function isUserOnline(userId: string): boolean {
  return connectedUsers.has(userId);
}