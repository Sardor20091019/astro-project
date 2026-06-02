import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const messageId = searchParams.get("messageId");

    if (!messageId) {
      return NextResponse.json({ error: "Missing message ID" }, { status: 400 });
    }

    // Find the message to verify ownership
    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Only allow the sender to remove it
    if (message.senderId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Remove from Neon
    await prisma.message.delete({
      where: { id: messageId }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Delete handler crash:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}