import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import MutualMatch from "@/models/MutualMatch";
import Message from "@/models/Message";
import User from "@/models/User";

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
        const otherUser = await User.findById(otherUserId).select("name image");

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

    return NextResponse.json({
      success: true,
      conversations: filteredConversations,
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
