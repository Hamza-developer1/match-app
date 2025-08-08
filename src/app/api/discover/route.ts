import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Match from "@/models/Match";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters for filtering
    const { searchParams } = new URL(request.url);
    const universityFilter = searchParams.get('university');
    const majorFilter = searchParams.get('major');
    const yearFilter = searchParams.get('year');
    const interestFilter = searchParams.get('interest');
    
    const filters = {
      university: universityFilter,
      major: majorFilter,
      year: yearFilter,
      interest: interestFilter
    };

    await connectDB();
    
    // Get current user with profile data
    const currentUser = await User.findOne(
      { email: session.user.email },
      { _id: 1, profile: 1, email: 1 }
    ).lean();
    
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentUserId = currentUser._id.toString();
    const currentUserInterests = currentUser.profile?.interests || [];


    // Build match criteria with filters
    const matchCriteria: any = {
      _id: { $ne: currentUser._id },
      isActive: true,
      isStudent: true
    };

    if (universityFilter) {
      matchCriteria['profile.university'] = { $regex: universityFilter, $options: 'i' };
    }
    if (majorFilter) {
      matchCriteria['profile.major'] = { $regex: majorFilter, $options: 'i' };
    }
    if (yearFilter) {
      matchCriteria['profile.year'] = parseInt(yearFilter);
    }
    if (interestFilter) {
      matchCriteria['profile.interests'] = { $in: [new RegExp(interestFilter, 'i')] };
    }

    // Use aggregation pipeline for better performance with interest-based sorting
    const potentialMatches = await User.aggregate([
      // Stage 1: Match active students with filters (excluding self)
      {
        $match: matchCriteria
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
      // Stage 4: Calculate common interests score
      {
        $addFields: {
          commonInterests: {
            $size: {
              $ifNull: [
                {
                  $setIntersection: [
                    { $ifNull: ['$profile.interests', []] },
                    currentUserInterests
                  ]
                },
                []
              ]
            }
          },
          totalInterests: {
            $size: { $ifNull: ['$profile.interests', []] }
          }
        }
      },
      // Stage 5: Calculate compatibility score (prioritize common interests)
      {
        $addFields: {
          compatibilityScore: {
            $add: [
              { $multiply: ['$commonInterests', 10] }, // Heavy weight for common interests
              { $cond: [{ $eq: ['$profile.university', currentUser.profile?.university] }, 3, 0] }, // Same university bonus
              { $cond: [{ $eq: ['$profile.major', currentUser.profile?.major] }, 2, 0] }, // Same major bonus
              { $cond: [{ $gt: ['$totalInterests', 0] }, 1, 0] } // Has interests bonus
            ]
          }
        }
      },
      // Stage 6: Sort by compatibility score (highest first), then by recent activity
      {
        $sort: {
          compatibilityScore: -1,
          lastActive: -1
        }
      },
      // Stage 7: Remove temporary fields and limit results
      {
        $project: {
          password: 0,
          interactions: 0,
          commonInterests: 0,
          totalInterests: 0,
          compatibilityScore: 0
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

