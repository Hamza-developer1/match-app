import { Server as SocketIOServer } from 'socket.io';
import { NextApiRequest } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../app/api/auth/[...nextauth]/route';
import User from '../models/User';
import connectDB from './mongodb';

interface ExtendedNextApiRequest extends NextApiRequest {
  socket: {
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
  if (!req.socket.server.io) {
    console.log('Initializing Socket.IO server...');
    
    const io = new SocketIOServer(req.socket.server as any, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
    });

    // Authentication middleware
    io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        // In a real implementation, you'd verify the JWT token here
        // For now, we'll assume the token contains the user email
        await connectDB();
        const user = await User.findOne({ email: token });
        
        if (!user) {
          return next(new Error('User not found'));
        }

        (socket as any).userId = user._id.toString();
        (socket as any).userEmail = user.email;
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });

    io.on('connection', (socket) => {
      const userId = (socket as any).userId;
      const userEmail = (socket as any).userEmail;
      
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
    });

    req.socket.server.io = io;
  }
  
  res.end();
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