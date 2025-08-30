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

    const { matchId, receiverId, isTyping } = await req.json();
    
    if (!matchId || !receiverId || typeof isTyping !== 'boolean') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();

    // Verify that both users have a mutual match
    const mutualMatch = await (MutualMatch as any).findMatch(session.user.id, receiverId);
    if (!mutualMatch || mutualMatch._id.toString() !== matchId) {
      return NextResponse.json({ error: 'Invalid match' }, { status: 403 });
    }

    // Send typing indicator to receiver
    await pusher.trigger(CHANNELS.USER(receiverId), EVENTS.TYPING_USER_TYPING, {
      matchId,
      userId: session.user.id,
      isTyping
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling typing indicator:', error);
    return NextResponse.json({ error: 'Failed to send typing indicator' }, { status: 500 });
  }
}