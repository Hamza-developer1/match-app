import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Match from '@/models/Match';
import MutualMatch from '@/models/MutualMatch';
import Message from '@/models/Message';

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userId = user._id.toString();

    // Delete all related data in parallel
    await Promise.all([
      // Delete all matches where user is involved
      Match.deleteMany({
        $or: [
          { userId: userId },
          { targetUserId: userId }
        ]
      }),
      
      // Delete all mutual matches where user is involved  
      MutualMatch.deleteMany({
        $or: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      }),
      
      // Delete all messages where user is involved
      Message.deleteMany({
        $or: [
          { senderId: userId },
          { receiverId: userId }
        ]
      })
    ]);

    // Finally delete the user
    await User.findByIdAndDelete(userId);

    return NextResponse.json(
      { message: 'Account deleted successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}