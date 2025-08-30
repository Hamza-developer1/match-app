import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pusher, CHANNELS, EVENTS } from '@/lib/pusher';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Testing Pusher server-side...');
    console.log('Pusher app ID:', process.env.PUSHER_APP_ID);
    console.log('Pusher app key:', process.env.PUSHER_APP_KEY);
    console.log('Pusher cluster:', process.env.PUSHER_CLUSTER);

    // Test sending a notification to the user
    await pusher.trigger(CHANNELS.USER(session.user.id), 'test-event', {
      message: 'Pusher is working!',
      timestamp: new Date().toISOString()
    });

    console.log('Test message sent to channel:', CHANNELS.USER(session.user.id));

    return NextResponse.json({ 
      success: true, 
      message: 'Test notification sent via Pusher',
      channel: CHANNELS.USER(session.user.id)
    });
  } catch (error) {
    console.error('Pusher test error:', error);
    return NextResponse.json({ 
      error: 'Failed to send test notification',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}