"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { pusherClient } from "@/lib/pusher";
import { Bell } from "lucide-react";
import Link from "next/link";

export default function MessageBell() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [hasUnread, setHasUnread] = useState(false);
  const currentUserId = session?.user?.id;

  // Automatically clear the badge if the user is actively inside the messaging hub
  useEffect(() => {
    if (pathname === "/messages") {
      setHasUnread(false);
    }
  }, [pathname]);

  // Listen to incoming global websocket streams
  useEffect(() => {
    if (!currentUserId) return;

    const channelName = `chat_${currentUserId}`;
    pusherClient.subscribe(channelName);

    const handleIncomingAlert = () => {
      // Only ping the bell badge if the user isn't currently browsing the message view
      if (pathname !== "/messages") {
        setHasUnread(true);
      }
    };

    pusherClient.bind("new-message", handleIncomingAlert);

    return () => {
      pusherClient.unsubscribe(channelName);
      pusherClient.unbind("new-message", handleIncomingAlert);
    };
  }, [currentUserId, pathname]);

  return (
    <Link 
      href="/messages" 
      className="relative p-2 rounded-xl border border-zinc-900 bg-zinc-950/40 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-all duration-200 flex items-center justify-center group"
      title="Open Messages"
    >
      <Bell size={16} className="transition duration-200 group-active:scale-95" />
      
      {/* Premium Micro Dot Notification Badge */}
      {hasUnread && (
        <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
        </span>
      )}
    </Link>
  );
}