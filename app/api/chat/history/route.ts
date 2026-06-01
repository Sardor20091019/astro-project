import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
    console.log("👉 NEXT.JS IS USING DATABASE:", process.env.DATABASE_URL);
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const receiverId = searchParams.get("receiverId");

  if (!receiverId) return NextResponse.json({ error: "Missing receiverId" }, { status: 400 });

  try {
    const currentUserId = session.user.id;

    // Fetch conversations where either user is the sender or receiver
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: receiverId },
          { senderId: receiverId, receiverId: currentUserId },
        ],
      },
      orderBy: { createdAt: "asc" },
      include: {
        sender: { select: { name: true, image: true, id: true } },
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load messages" }, { status: 500 });
  }
}