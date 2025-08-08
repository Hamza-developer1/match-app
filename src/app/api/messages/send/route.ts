import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import MutualMatch from '@/models/MutualMatch';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const sender = await User.findOne({ email: session.user.email });
    if (!sender || !sender._id) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { receiverId, content, messageType = 'text' } = body;

    if (!receiverId || !content) {
      return NextResponse.json({ 
        error: 'Receiver ID and content are required' 
      }, { status: 400 });
    }

    // Verify that both users have a mutual match
    const mutualMatch = await (MutualMatch as any).findMatch(sender._id.toString(), receiverId);
    if (!mutualMatch) {
      return NextResponse.json({ 
        error: 'Cannot send message - no mutual match exists' 
      }, { status: 403 });
    }

    // Create the message
    const message = new Message({
      matchId: mutualMatch._id.toString(),
      senderId: sender._id.toString(),
      receiverId,
      content,
      messageType,
    });

    await message.save();

    // Update the mutual match's lastMessageAt
    mutualMatch.lastMessageAt = new Date();
    await mutualMatch.save();

    // Populate sender info for the response
    const populatedMessage = await Message.findById(message._id).populate('senderId', 'name image');

    return NextResponse.json({
      success: true,
      message: populatedMessage,
    });

  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ 
      error: 'Failed to send message' 
    }, { status: 500 });
  }
}