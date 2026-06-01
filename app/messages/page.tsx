// app/messages/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Search, MessageSquare, UserPlus, Compass } from "lucide-react";
import ChatWindow from "@/components/ChatWindow";

interface Conversation {
  user: { id: string; name: string | null; image: string | null; };
  lastMessage: { text: string; createdAt: string; };
}

interface SearchedUser {
  id: string;
  name: string | null;
  image: string | null;
  email: string | null;
}

function MessagesDashboardContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchResults, setSearchResults] = useState<SearchedUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChat, setActiveChat] = useState<{ id: string; name: string } | null>(null);
  const [loadingConversations, setLoadingConversations] = useState(true);

  const currentUserId = session?.user?.id;

  useEffect(() => {
    const targetUserId = searchParams.get("userId");
    const targetUserName = searchParams.get("userName");

    if (targetUserId && targetUserName) {
      setActiveChat({
        id: targetUserId,
        name: decodeURIComponent(targetUserName),
      });
    }
  }, [searchParams]);

  useEffect(() => {
    if (!currentUserId) return;
    const fetchConversations = async () => {
      try {
        const res = await fetch("/api/chat/conversations");
        if (res.ok) setConversations(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingConversations(false);
      }
    };
    fetchConversations();
  }, [currentUserId, activeChat]);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) setSearchResults(await res.json());
      } catch (err) {
        console.error(err);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  if (!session) {
    return (
      <div className="h-[calc(100vh-64px)] bg-[#050505] flex items-center justify-center text-zinc-600 text-[10px] tracking-[0.2em] uppercase font-bold">
        Access Denied • Authenticate Account
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] w-full bg-[#080808] text-white flex overflow-hidden font-sans">
      <div className="max-w-[1600px] w-full mx-auto flex h-full border-x border-zinc-900/60 bg-zinc-950/10">
        
        {/* Left Hand Directory Sidebar */}
        <div className="w-85 border-r border-zinc-900 flex flex-col bg-[#09090b]/80 h-full backdrop-blur-md">
          
          {/* Top Search Block Panel */}
          <div className="p-4 border-b border-zinc-900 relative">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search global users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900/50 text-xs text-zinc-200 pl-10 pr-4 py-2.5 rounded-xl border border-zinc-800/80 focus:outline-none focus:border-zinc-700 transition-all duration-200 placeholder-zinc-500"
              />
            </div>

            {/* Dropdown Floater Layer */}
            {searchResults.length > 0 && (
              <div className="absolute left-4 right-4 mt-2 bg-zinc-900 border border-zinc-800/80 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 max-h-64 overflow-y-auto backdrop-blur-xl">
                {searchResults.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      setActiveChat({ id: user.id, name: user.name || "User" });
                      setSearchQuery("");
                      setSearchResults([]);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-zinc-800/40 flex items-center gap-3 border-b border-zinc-800/40 last:border-0 transition duration-150"
                  >
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700/50 flex items-center justify-center font-bold text-xs text-zinc-300 uppercase">
                      {(user.name || "?")[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold truncate text-zinc-200">{user.name}</p>
                      <p className="text-[10px] text-zinc-500 truncate mt-0.5">{user.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Thread Scroller Feed Container */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex items-center justify-between px-4 pt-5 pb-2">
              <span className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500">Channels</span>
              <span className="text-[9px] font-mono text-zinc-600 font-bold">({conversations.length})</span>
            </div>

            {loadingConversations ? (
              <div className="p-4 text-xs text-zinc-600 animate-pulse font-medium tracking-wide">Querying open indices...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 mx-3 mt-2 rounded-xl border border-zinc-900/60 bg-zinc-900/10 text-xs text-zinc-500 flex items-start gap-2.5 leading-relaxed font-medium">
                <UserPlus size={14} className="text-zinc-600 mt-0.5 shrink-0" />
                <span>No historical entries. Search up a nickname string to open a channel line.</span>
              </div>
            ) : (
              <div className="px-2 space-y-0.5">
                {conversations.map((chat) => {
                  const isActive = activeChat?.id === chat.user.id;
                  return (
                    <button
                      key={chat.user.id}
                      onClick={() => setActiveChat({ id: chat.user.id, name: chat.user.name || "User" })}
                      className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 ${
                        isActive 
                          ? "bg-zinc-900/80 border border-zinc-800 text-white shadow-inner" 
                          : "hover:bg-zinc-900/30 border border-transparent text-zinc-400"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center font-black text-xs text-zinc-400 uppercase shrink-0">
                        {(chat.user.name || "?")[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <p className={`text-xs font-semibold truncate ${isActive ? "text-white" : "text-zinc-200"}`}>
                            {chat.user.name || "Anonymous"}
                          </p>
                          <span className="text-[8px] text-zinc-600 font-bold font-mono tracking-tighter">
                            {new Date(chat.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 truncate tracking-wide font-medium">{chat.lastMessage.text}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Hand Workspace Grid Content Panel */}
        <div className="flex-1 flex flex-col p-6 bg-gradient-to-b from-zinc-950/20 via-transparent to-transparent h-full">
          {activeChat && currentUserId ? (
            <div className="w-full max-w-4xl mx-auto h-full">
              <ChatWindow
                currentUserId={currentUserId}
                receiverId={activeChat.id}
                receiverName={activeChat.name}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-zinc-900 rounded-2xl bg-zinc-950/5 m-2">
              <div className="p-4 rounded-full bg-zinc-900/30 border border-zinc-900 mb-4 text-zinc-700 animate-pulse">
                <Compass size={22} />
              </div>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Terminal Idle</h4>
              <p className="text-[11px] text-zinc-500 max-w-xs mt-1.5 leading-relaxed font-medium">
                Select an active discussion framework from the sidebar directory index or initiate a query hook search parameters lookup.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function MessagesDashboard() {
  return (
    <Suspense fallback={
      <div className="h-[calc(100vh-64px)] bg-[#080808] flex items-center justify-center text-zinc-600 text-[10px] tracking-widest uppercase font-mono">
        Configuring Dashboard Environment...
      </div>
    }>
      <MessagesDashboardContent />
    </Suspense>
  );
}