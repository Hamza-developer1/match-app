import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pusher, CHANNELS, EVENTS } from '@/lib/pusher';
import connectToDatabase from '@/lib/mongodb';
import MutualMatch from '@/models/MutualMatch';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { matchId, receiverId, content, messageType = 'text' } = await req.json();
    
    if (!matchId || !receiverId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();

    // Verify that both users have a mutual match
    const mutualMatch = await (MutualMatch as any).findMatch(session.user.id, receiverId);
    if (!mutualMatch) {
      return NextResponse.json({ error: 'Cannot send message - no mutual match exists' }, { status: 403 });
    }

    // Verify that the provided matchId corresponds to the actual mutual match
    if (mutualMatch._id.toString() !== matchId) {
      return NextResponse.json({ error: 'Invalid match ID' }, { status: 403 });
    }

    const messageData = {
      matchId,
      senderId: session.user.id,
      content,
      messageType,
      timestamp: new Date().toISOString()
    };

    // Send message to receiver via Pusher
    await pusher.trigger(CHANNELS.USER(receiverId), EVENTS.MESSAGE_RECEIVE, messageData);

    // Confirm message sent to sender
    await pusher.trigger(CHANNELS.USER(session.user.id), EVENTS.MESSAGE_SENT, {
      matchId,
      receiverId,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}