import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Match from "@/models/Match";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    // Get current user
    const currentUser = await User.findOne(
      { email: session.user.email },
      { _id: 1 } // Only fetch _id for performance
    ).lean();
    
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentUserId = currentUser._id.toString();

    // Use aggregation pipeline for better performance
    const potentialMatches = await User.aggregate([
      // Stage 1: Match active students (excluding self)
      {
        $match: {
          _id: { $ne: currentUser._id },
          isActive: true,
          isStudent: true
        }
      },
      // Stage 2: Lookup to exclude users with like/reject actions
      {
        $lookup: {
          from: 'matches',
          let: { targetId: { $toString: '$_id' } },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$userId', currentUserId] },
                    { $eq: ['$targetUserId', '$$targetId'] },
                    { $in: ['$action', ['like', 'reject']] }
                  ]
                }
              }
            }
          ],
          as: 'interactions'
        }
      },
      // Stage 3: Filter out users with existing interactions
      {
        $match: {
          interactions: { $size: 0 }
        }
      },
      // Stage 4: Remove the interactions field and limit results
      {
        $project: {
          password: 0,
          interactions: 0
        }
      },
      {
        $limit: 10
      }
    ]);

    return NextResponse.json({ users: potentialMatches });
  } catch (error) {
    console.error("Discover fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { targetUserId, action } = body;

    if (!targetUserId || !action || !['like', 'reject', 'skip'].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    await connectToDatabase();
    
    // Get current user (only fetch _id for performance)
    const currentUser = await User.findOne(
      { email: session.user.email },
      { _id: 1 }
    ).lean();
    
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentUserId = currentUser._id.toString();

    // Only create match record for like and reject actions
    // Skip actions are temporary and don't get stored
    let isMatch = false;
    
    if (action !== 'skip') {
      // Create/update match record
      await Match.findOneAndUpdate(
        { userId: currentUserId, targetUserId },
        { userId: currentUserId, targetUserId, action },
        { upsert: true, new: true }
      );

      // Check for mutual like only if current action is like
      if (action === 'like') {
        const reciprocalLike = await Match.findOne({
          userId: targetUserId,
          targetUserId: currentUserId,
          action: 'like'
        }).lean();
        
        isMatch = !!reciprocalLike;
      }
    }

    return NextResponse.json({ 
      success: true, 
      isMatch,
      message: isMatch ? "It's a match! 🎉" : "Action recorded"
    });
  } catch (error) {
    console.error("Match action error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}