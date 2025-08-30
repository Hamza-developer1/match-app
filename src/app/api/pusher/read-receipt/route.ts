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

    const { matchId, senderId } = await req.json();
    
    if (!matchId || !senderId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();

    // Verify that both users have a mutual match
    const mutualMatch = await (MutualMatch as any).findMatch(session.user.id, senderId);
    if (!mutualMatch || mutualMatch._id.toString() !== matchId) {
      return NextResponse.json({ error: 'Invalid match' }, { status: 403 });
    }

    // Send read receipt to sender
    await pusher.trigger(CHANNELS.USER(senderId), EVENTS.MESSAGE_READ_RECEIPT, {
      matchId,
      readByUserId: session.user.id,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling read receipt:', error);
    return NextResponse.json({ error: 'Failed to send read receipt' }, { status: 500 });
  }
}