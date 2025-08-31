import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pusher, CHANNELS, EVENTS } from '@/lib/pusher';
import connectToDatabase from '@/lib/mongodb';
import MutualMatch from '@/models/MutualMatch';
import Message from '@/models/Message';

export async function POST(req: NextRequest) {
  console.log('🔔 Pusher send-message API called');
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.log('❌ Unauthorized - no session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { matchId, receiverId, content, messageType = 'text', sendToSender = true } = await req.json();
    console.log('📝 Pusher API request data:', { matchId, receiverId, content, messageType });
    
    if (!matchId || !receiverId || !content) {
      console.log('❌ Missing required fields');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();
    console.log('✅ Connected to database');

    // Get the sender's actual user ID from database
    const User = require('@/models/User').default;
    const sender = await User.findOne({ email: session.user.email });
    if (!sender) {
      console.log('❌ User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    console.log('👤 Found sender:', sender._id);

    // Verify that both users have a mutual match
    const mutualMatch = await (MutualMatch as any).findMatch(sender._id.toString(), receiverId);
    if (!mutualMatch) {
      console.log('❌ No mutual match found');
      return NextResponse.json({ error: 'Cannot send message - no mutual match exists' }, { status: 403 });
    }
    console.log('💑 Found mutual match:', mutualMatch._id);

    // Verify that the provided matchId corresponds to the actual mutual match
    if (mutualMatch._id.toString() !== matchId) {
      console.log('❌ Invalid match ID');
      return NextResponse.json({ error: 'Invalid match ID' }, { status: 403 });
    }

    // Get the actual message from the database that was just created
    // Find the most recent message for this match from this sender
    console.log('🔍 Looking for recent message...');
    const savedMessage = await Message.findOne({
      matchId,
      senderId: sender._id.toString()
    }).sort({ createdAt: -1 }).populate('senderId', 'name image');

    if (!savedMessage) {
      console.log('❌ Message not found after creation');
      return NextResponse.json({ error: 'Message not found after creation' }, { status: 500 });
    }
    console.log('✅ Found saved message:', savedMessage._id);

    // Send the complete message object to both users via Pusher
    const messageData = {
      matchId,
      senderId: sender._id.toString(),
      content,
      messageType,
      timestamp: savedMessage.createdAt.toISOString(),
      _id: savedMessage._id.toString(),
      message: savedMessage // Include the full message object
    };
    
    console.log('📤 Sending to receiver channel:', CHANNELS.USER(receiverId));
    await pusher.trigger(CHANNELS.USER(receiverId), EVENTS.MESSAGE_RECEIVE, messageData);
    console.log('✅ Sent to receiver');

    // Only send to sender if requested (for backward compatibility)
    if (sendToSender) {
      console.log('📤 Sending to sender channel:', CHANNELS.USER(sender._id.toString()));
      await pusher.trigger(CHANNELS.USER(sender._id.toString()), EVENTS.MESSAGE_RECEIVE, messageData);
      console.log('✅ Sent to sender');
    } else {
      console.log('⏭️ Skipping sender (handled locally)');
    }

    console.log('🎉 Pusher messages sent successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}