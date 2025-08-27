import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import MutualMatch from "@/models/MutualMatch";
import Message from "@/models/Message";
import User from "@/models/User";
import Match from "@/models/Match";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = user._id?.toString();
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 400 });
    }


    // Get all mutual matches for this user
    const matches = await MutualMatch.find({
      $or: [{ user1Id: userId }, { user2Id: userId }],
      isActive: true,
    }).sort({ lastMessageAt: -1, matchedAt: -1 });

    // For each match, get the other user's info and latest message
    const conversations = await Promise.all(
      matches.map(async (match) => {
        const otherUserId =
          match.user1Id === userId ? match.user2Id : match.user1Id;
        const otherUser = await User.findById(otherUserId).select("name image email profile lastActive");

        // Get the latest message for this conversation
        const latestMessage = await Message.findOne({
          matchId: match._id?.toString(),
        }).sort({ createdAt: -1 });

        // Get unread message count
        const unreadCount = await Message.countDocuments({
          matchId: match._id?.toString(),
          receiverId: userId,
          isRead: false,
        });

        return {
          matchId: match._id?.toString(),
          otherUser,
          matchedAt: match.matchedAt,
          lastMessageAt: match.lastMessageAt,
          latestMessage: latestMessage
            ? {
                content: latestMessage.content,
                senderId: latestMessage.senderId,
                createdAt: latestMessage.createdAt,
                messageType: latestMessage.messageType,
              }
            : null,
          unreadCount,
          userSeen:
            match.user1Id === userId ? match.user1Seen : match.user2Seen,
        };
      })
    );

    const filteredConversations = conversations.filter((conv) => conv.otherUser);

    // Get pending connections (users this user liked but didn't get liked back yet)
    const pendingLikes = await Match.find({
      userId: userId,
      action: 'like'
    });

    const pendingConnections = await Promise.all(
      pendingLikes
        .filter(like => {
          // Only include if it's not already a mutual match
          return !filteredConversations.some(conv => 
            conv.otherUser._id.toString() === like.targetUserId
          );
        })
        .map(async (like) => {
          const otherUser = await User.findById(like.targetUserId).select("name image email profile lastActive");
          if (!otherUser) return null;

          return {
            matchId: null, // No match ID since it's not a mutual match yet
            otherUser,
            matchedAt: like.createdAt,
            lastMessageAt: null,
            latestMessage: null,
            unreadCount: 0,
            userSeen: true,
            status: 'pending' // Add status field
          };
        })
    );

    const validPendingConnections = pendingConnections.filter(conn => conn !== null);

    // Add status to mutual matches
    const conversationsWithStatus = filteredConversations.map(conv => ({
      ...conv,
      status: 'accepted'
    }));

    const allConnections = [...conversationsWithStatus, ...validPendingConnections];

    return NextResponse.json({
      success: true,
      conversations: allConnections,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch conversations",
      },
      { status: 500 }
    );
  }
}
