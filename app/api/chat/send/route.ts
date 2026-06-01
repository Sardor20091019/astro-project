import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { receiverId, text } = await req.json();
    const senderId = session.user.id;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        text,
      },
      include: {
        sender: {
          select: { name: true, image: true, id: true }
        }
      }
    });

    await pusherServer.trigger(`chat_${receiverId}`, "new-message", message);

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}