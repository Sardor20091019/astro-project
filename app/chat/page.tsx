// app/chat/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ChatWindow from "@/components/ChatWindow";

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function ChatPage({ searchParams }: PageProps) {
  // 1. Secure the route - redirect to sign-in if not authenticated
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  // Next.js 15+ requires awaiting searchParams
  const resolvedParams = await searchParams;
  const receiverId = resolvedParams.id;

  if (!receiverId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-zinc-400 text-sm">
        No user specified for conversation. Go back to the gallery.
      </div>
    );
  }

  // 2. Look up the receiver's name inside Neon
  const receiverData = await prisma.user.findUnique({
    where: { id: receiverId },
    select: { name: true },
  });

  if (!receiverData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-zinc-400 text-sm">
        User account not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 flex items-center justify-center">
      <ChatWindow
        currentUserId={session.user.id}
        receiverId={receiverId}
        receiverName={receiverData.name || "Photographer"}
      />
    </div>
  );
}