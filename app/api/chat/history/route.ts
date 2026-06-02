import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const receiverId = searchParams.get("receiverId");
  
  // Get page from query, default to 0
  const page = parseInt(searchParams.get("page") || "0");
  const pageSize = 20;

  if (!receiverId) return NextResponse.json({ error: "Missing receiverId" }, { status: 400 });

  try {
    const currentUserId = session.user.id;

    // Fetch messages in reverse order (newest first) with skip/take
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: receiverId },
          { senderId: receiverId, receiverId: currentUserId },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: pageSize,
      skip: page * pageSize,
      include: {
        sender: { select: { name: true, image: true, id: true } },
      },
    });

    // Reverse them back so they appear in chronological order for the UI
    return NextResponse.json(messages.reverse());
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load messages" }, { status: 500 });
  }
}