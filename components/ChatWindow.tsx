"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { pusherClient } from "@/lib/pusher";
import { toast } from "sonner";

interface Message {
  id: string;
  text: string;
  senderId: string;
  createdAt: string;
  sender: { name: string | null; image: string | null; id: string };
}

interface ChatWindowProps {
  currentUserId: string;
  receiverId: string;
  receiverName: string;
}

export default function ChatWindow({ currentUserId, receiverId, receiverName }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  const chatEndRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const loadChatHistory = useCallback(async (pageNum: number) => {
    try {
      const res = await fetch(`/api/chat/history?receiverId=${receiverId}&page=${pageNum}`);
      if (!res.ok) throw new Error("Failed to load");
      
      const newMessages: Message[] = await res.json();
      if (newMessages.length < 20) setHasMore(false);
      
      setMessages((prev) => [...newMessages, ...prev]);
    } catch (err) {
      toast.error("Could not load older messages.");
    }
  }, [receiverId]);

  useEffect(() => {
    setMessages([]);
    setPage(0);
    setHasMore(true);
    loadChatHistory(0);
  }, [receiverId, loadChatHistory]);

  useEffect(() => {
    if (!currentUserId || !pusherClient) return;
    const channelName = `chat_${currentUserId}`;
    pusherClient.subscribe(channelName);

    const handleNewMessage = (newMessage: Message) => {
      if (newMessage.senderId === receiverId) setMessages((prev) => [...prev, newMessage]);
    };

    pusherClient.bind("new-message", handleNewMessage);
    return () => { 
      pusherClient?.unsubscribe(channelName); 
      pusherClient?.unbind("new-message", handleNewMessage); 
    };
  }, [currentUserId, receiverId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    setLoading(true);
    const textToSend = inputMessage.trim();
    setInputMessage("");

    try {
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId, text: textToSend }),
      });

      if (res.ok) {
        const savedMessage = await res.json();
        setMessages((prev) => [...prev, savedMessage]);
      } else {
        setInputMessage(textToSend);
        toast.error("Failed to send message.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-zinc-950/40 border border-zinc-800/80 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl">
      <div className="px-6 py-4 border-b border-zinc-900 bg-zinc-900/20">
        <h3 className="text-sm font-semibold text-zinc-200">{receiverName}</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {hasMore && (
          <button 
            onClick={() => { setPage((p) => p + 1); loadChatHistory(page + 1); }}
            className="w-full text-center text-[10px] text-zinc-600 hover:text-zinc-400 p-2 uppercase tracking-widest font-bold"
          >
            Load Older Messages
          </button>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.senderId === currentUserId ? "justify-end" : "justify-start"}`}>
            <div className={`px-4 py-2 rounded-2xl text-sm ${msg.senderId === currentUserId ? "bg-white text-black" : "bg-zinc-900 text-white"}`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-900 bg-zinc-950">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="w-full bg-zinc-900 text-white p-3 rounded-xl focus:outline-none"
          placeholder="Type a message..."
        />
      </form>
    </div>
  );
}