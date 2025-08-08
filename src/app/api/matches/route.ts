import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Match from '@/models/Match';
import MutualMatch from '@/models/MutualMatch';
import User from '@/models/User';

// Handle user actions (like, reject, skip)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const { targetUserId, action } = await request.json();
    
    if (!targetUserId || !action || !['like', 'reject', 'skip'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    // Find current user
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user already acted on this target
    const existingMatch = await Match.findOne({
      userId: currentUser._id.toString(),
      targetUserId: targetUserId
    });

    if (existingMatch) {
      return NextResponse.json({ error: 'Already acted on this user' }, { status: 400 });
    }

    // Create the match record
    const match = new Match({
      userId: currentUser._id.toString(),
      targetUserId: targetUserId,
      action: action
    });

    await match.save();

    // If it's a like, check for mutual match
    let mutualMatch = null;
    if (action === 'like') {
      // Check if the target user has also liked the current user
      const reciprocalMatch = await Match.findOne({
        userId: targetUserId,
        targetUserId: currentUser._id.toString(),
        action: 'like'
      });

      if (reciprocalMatch) {
        // Create mutual match
        mutualMatch = (MutualMatch as any).createMatch(
          currentUser._id.toString(),
          targetUserId
        );
        await mutualMatch.save();

        // Get target user info for notification
        const targetUser = await User.findById(targetUserId);
        
        
        return NextResponse.json({ 
          success: true, 
          match: true,
          mutualMatch: {
            id: mutualMatch._id,
            user: {
              id: targetUser?._id,
              name: targetUser?.name,
              image: targetUser?.image
            }
          }
        });
      }
    }


    return NextResponse.json({ 
      success: true, 
      match: false 
    });

  } catch (error) {
    console.error('Match action error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get user's mutual matches
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = currentUser._id.toString();

    // Find all mutual matches for this user
    const mutualMatches = await MutualMatch.find({
      $or: [
        { user1Id: userId },
        { user2Id: userId }
      ],
      isActive: true
    }).sort({ matchedAt: -1 });

    // Get user details for each match
    const matchesWithUserInfo = await Promise.all(
      mutualMatches.map(async (match) => {
        const otherUserId = match.user1Id === userId ? match.user2Id : match.user1Id;
        const otherUser = await User.findById(otherUserId).select('name email image profile');
        
        return {
          id: match._id,
          matchedAt: match.matchedAt,
          lastMessageAt: match.lastMessageAt,
          user: {
            id: otherUser?._id,
            name: otherUser?.name,
            email: otherUser?.email,
            image: otherUser?.image,
            profile: otherUser?.profile
          },
          seen: match.user1Id === userId ? match.user1Seen : match.user2Seen
        };
      })
    );

    return NextResponse.json({ matches: matchesWithUserInfo });

  } catch (error) {
    console.error('Get matches error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}