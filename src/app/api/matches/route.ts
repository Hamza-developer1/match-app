import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Match from '@/models/Match';
import MutualMatch from '@/models/MutualMatch';
import User from '@/models/User';
import mongoose from 'mongoose';
import { z } from 'zod';
import { emitMatchNotification, emitLikeNotification } from '@/lib/pusher-notifications';

const matchActionSchema = z.object({
  targetUserId: z.string().refine(
    (id) => mongoose.Types.ObjectId.isValid(id),
    { message: 'Invalid target user ID' }
  ),
  action: z.enum(['like', 'reject', 'skip'])
});

// Handle user actions (like, reject, skip)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const body = await request.json();
    const { targetUserId, action } = matchActionSchema.parse(body);

    // Find current user
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user already acted on this target
    const existingMatch = await Match.findOne({
      userId: currentUser._id,
      targetUserId: targetUserId
    });

    // Allow overriding skip actions, but block if already liked/rejected
    if (existingMatch && existingMatch.action !== 'skip') {
      return NextResponse.json({ error: 'Already acted on this user' }, { status: 400 });
    }

    // Handle match record creation or update
    let match;
    if (existingMatch && existingMatch.action === 'skip') {
      // Update the existing skip record
      existingMatch.action = action;
      existingMatch.createdAt = new Date();
      match = await existingMatch.save();
    } else {
      // Create new match record
      match = new Match({
        userId: currentUser._id,
        targetUserId: targetUserId,
        action: action
      });
      await match.save();
    }

    // If it's a like, check for mutual match
    let mutualMatch = null;
    if (action === 'like') {
      // Check if the target user has also liked the current user
      const reciprocalMatch = await Match.findOne({
        userId: targetUserId,
        targetUserId: currentUser._id,
        action: 'like'
      });

      if (reciprocalMatch) {
        // Create mutual match
        mutualMatch = (MutualMatch as any).createMatch(
          currentUser._id,
          targetUserId
        );
        await mutualMatch.save();

        // Get target user info for notification
        const targetUser = await User.findById(targetUserId);
        
        // Send match notification to both users via Pusher
        if (targetUser) {
          emitMatchNotification(String(currentUser._id), targetUserId, {
            id: mutualMatch._id,
            user: {
              id: targetUser._id,
              name: targetUser.name,
              image: targetUser.image
            }
          });
        }
        
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
      } else {
        // No mutual match yet, but send like notification to target user
        const targetUser = await User.findById(targetUserId);
        if (targetUser) {
          emitLikeNotification(targetUserId, {
            id: currentUser._id,
            name: currentUser.name,
            image: currentUser.image
          });
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      match: false 
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }
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

    const userId = currentUser._id;

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