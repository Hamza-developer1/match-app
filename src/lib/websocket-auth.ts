import jwt from 'jsonwebtoken';

export interface WebSocketTokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export function generateWebSocketToken(userId: string, email: string): string {
  const payload: WebSocketTokenPayload = {
    userId,
    email,
  };

  const secret = process.env.WEBSOCKET_JWT_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('WebSocket JWT secret not configured');
  }

  return jwt.sign(payload, secret, {
    expiresIn: '24h',
  });
}

export function verifyWebSocketToken(token: string): WebSocketTokenPayload {
  try {
    const secret = process.env.WEBSOCKET_JWT_SECRET || process.env.NEXTAUTH_SECRET;
    if (!secret) {
      throw new Error('WebSocket JWT secret not configured');
    }
    
    const decoded = jwt.verify(token, secret) as WebSocketTokenPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}