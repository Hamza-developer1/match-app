import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateWebSocketToken } from '@/lib/websocket-auth';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    console.log('WebSocket token request received');
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    const session = await getServerSession(authOptions);
    console.log('Session retrieved:', session ? 'Session exists' : 'No session');
    console.log('Session user:', session?.user);
    
    if (!session?.user?.email) {
      console.log('No session found for WebSocket token request');
      return NextResponse.json(
        { error: 'Unauthorized - no session found' },
        { status: 401 }
      );
    }

    console.log('WebSocket token request for user:', session.user.email);
    await connectToDatabase();
    
    const user = await User.findOne({ email: session.user.email })
      .maxTimeMS(10000)
      .lean()
      .exec();
      
    if (!user) {
      console.log('User not found for WebSocket token:', session.user.email);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const token = generateWebSocketToken(user._id.toString(), user.email);
    console.log('WebSocket token generated successfully for:', session.user.email);

    return NextResponse.json({ token });
  } catch (error) {
    console.error('WebSocket token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}