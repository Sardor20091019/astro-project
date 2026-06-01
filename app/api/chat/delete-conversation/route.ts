// app/api/chat/delete-conversation/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = session.user.id;
    const { searchParams } = new URL(request.url);
    const receiverId = searchParams.get("receiverId");

    if (!receiverId) {
      return NextResponse.json({ error: "Missing receiverId parameter" }, { status: 400 });
    }

    // Safely purge all rows linking both participants from your message table
    await prisma.message.deleteMany({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: receiverId },
          { senderId: receiverId, receiverId: currentUserId },
        ],
      },
    });

    return NextResponse.json({ success: true, message: "Thread successfully purged" });
  } catch (error) {
    console.error("Database thread clear failure:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}