import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
//import { connectToDatabase } from "@/lib/mongodb";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  const startTime = Date.now();
  
  try {
    console.log("🔄 Profile API: Starting request");
    
    const sessionStart = Date.now();
    const session = await getServerSession(authOptions);
    const sessionTime = Date.now() - sessionStart;
    console.log(`⏱️ Session retrieval: ${sessionTime}ms`);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbConnectStart = Date.now();
    await connectToDatabase();
    const dbConnectTime = Date.now() - dbConnectStart;
    console.log(`⏱️ DB connection: ${dbConnectTime}ms`);

    const queryStart = Date.now();
    // Optimized query with specific field selection
    const user = await User.findOne(
      { email: session.user.email },
      {
        password: 0, // Exclude password
        __v: 0       // Exclude version key
      }
    ).lean();
    const queryTime = Date.now() - queryStart;
    console.log(`⏱️ User query: ${queryTime}ms`);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const totalTime = Date.now() - startTime;
    console.log(`✅ Profile API: Total time ${totalTime}ms`);

    return NextResponse.json({ user });
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`❌ Profile fetch error after ${totalTime}ms:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, image, profile } = body;

    await connectToDatabase();

    // Optimized update with projection
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        name,
        image,
        profile,
        lastActive: new Date(),
      },
      { 
        new: true, 
        runValidators: true,
        projection: { password: 0, __v: 0 } // Exclude unnecessary fields
      }
    ).lean();

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
