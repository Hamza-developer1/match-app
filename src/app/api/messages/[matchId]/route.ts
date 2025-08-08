import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import MutualMatch from '@/models/MutualMatch';
import User from '@/models/User';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user || !user._id) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { matchId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Verify the user is part of this match
    const mutualMatch = await MutualMatch.findById(matchId);
    if (!mutualMatch || 
        (mutualMatch.user1Id !== user._id.toString() && 
         mutualMatch.user2Id !== user._id.toString())) {
      return NextResponse.json({ 
        error: 'Access denied to this conversation' 
      }, { status: 403 });
    }

    // Get messages for this match
    const messages = await Message.find({ matchId })
      .populate('senderId', 'name image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Mark messages as read if they were sent to this user
    await Message.updateMany(
      { 
        matchId, 
        receiverId: user._id.toString(), 
        isRead: false 
      },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );

    // Get total count for pagination
    const totalMessages = await Message.countDocuments({ matchId });

    return NextResponse.json({
      success: true,
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalMessages / limit),
        totalMessages,
        hasMore: skip + messages.length < totalMessages,
      },
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch messages' 
    }, { status: 500 });
  }
}