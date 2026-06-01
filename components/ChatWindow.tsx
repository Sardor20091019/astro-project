// components/ChatWindow.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { pusherClient } from "@/lib/pusher";
import { Trash2, Send, ShieldAlert, FolderX } from "lucide-react";

interface Message {
  id: string;
  text: string;
  senderId: string;
  createdAt: string;
  sender: {
    name: string | null;
    image: string | null;
    id: string;
  };
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
  const [clearing, setClearing] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!receiverId) return;
    const loadChatHistory = async () => {
      try {
        const res = await fetch(`/api/chat/history?receiverId=${receiverId}`);
        if (res.ok) {
          setMessages(await res.json());
        }
      } catch (err) {
        console.error("Error loading chat history:", err);
      }
    };
    loadChatHistory();
  }, [receiverId]);

  useEffect(() => {
    if (!currentUserId) return;
    const channelName = `chat_${currentUserId}`;
    pusherClient.subscribe(channelName);

    const handleNewMessage = (newMessage: Message) => {
      if (newMessage.senderId === receiverId) {
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const handleDeletedMessage = ({ messageId }: { messageId: string }) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    };

    pusherClient.bind("new-message", handleNewMessage);
    pusherClient.bind("delete-message", handleDeletedMessage);

    return () => {
      pusherClient.unsubscribe(channelName);
      pusherClient.unbind("new-message", handleNewMessage);
      pusherClient.unbind("delete-message", handleDeletedMessage);
    };
  }, [currentUserId, receiverId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    setLoading(true);
    const textToSend = inputMessage.trim();
    setInputMessage("");

    const temporaryOptimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      text: textToSend,
      senderId: currentUserId,
      createdAt: new Date().toISOString(),
      sender: { id: currentUserId, name: "You", image: null }
    };

    setMessages((prev) => [...prev, temporaryOptimisticMessage]);

    try {
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId, text: textToSend }),
      });

      if (res.ok) {
        const savedMessage = await res.json();
        setMessages((prev) => 
          prev.map((msg) => msg.id === temporaryOptimisticMessage.id ? savedMessage : msg)
        );
      } else {
        setMessages((prev) => prev.filter((msg) => msg.id !== temporaryOptimisticMessage.id));
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => prev.filter((msg) => msg.id !== temporaryOptimisticMessage.id));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const res = await fetch(`/api/chat/delete?messageId=${messageId}`, { method: "DELETE" });
      if (res.ok) {
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Action: Purge entire chat history stream from storage safely
  const handleDeleteWholeChat = async () => {
    const confirmation = window.confirm(`Are you sure you want to permanently delete your entire conversation history with ${receiverName}? This action cannot be undone.`);
    if (!confirmation) return;

    setClearing(true);
    try {
      const res = await fetch(`/api/chat/delete-conversation?receiverId=${receiverId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMessages([]); // Wipe frontend screen instantly on validation success
      } else {
        console.error("Failed to delete the conversation thread matrix rows.");
      }
    } catch (err) {
      console.error("Error executing network deletion clear command:", err);
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-zinc-950/40 border border-zinc-800/80 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl">
      {/* Top Header Bar */}
      <div className="px-6 py-4 border-b border-zinc-900 bg-zinc-900/20 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700/50 flex items-center justify-center font-bold text-xs text-zinc-300 uppercase">
            {receiverName ? receiverName[0] : "?"}
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-zinc-200">{receiverName}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">Active Session</span>
            </div>
          </div>
        </div>

        {/* Global Delete Whole Chat Button */}
        {messages.length > 0 && (
          <button
            onClick={handleDeleteWholeChat}
            disabled={clearing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-900 bg-zinc-900/40 hover:bg-red-950/30 hover:border-red-900/50 text-zinc-500 hover:text-red-400 text-[10px] font-black uppercase tracking-widest transition-all duration-200 disabled:opacity-40"
          >
            <FolderX size={12} />
            {clearing ? "Clearing..." : "Clear Chat"}
          </button>
        )}
      </div>

      {/* Message Track Canvas */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-zinc-900 scrollbar-track-transparent">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-2">
            <ShieldAlert size={18} className="text-zinc-800" />
            <p className="text-[10px] font-black uppercase tracking-widest">End-to-End Secure</p>
            <p className="text-xs text-zinc-500">Send a greeting message to start this discussion frame.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isMe = msg.senderId === currentUserId;

              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"} group`}>
                  <div className={`flex items-end gap-2 max-w-[75%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                    
                    {/* Balanced Fluid Bubble Markup */}
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed font-medium tracking-wide break-words transition-all duration-200 ${
                      isMe
                        ? "bg-gradient-to-br from-zinc-100 to-zinc-200 text-black rounded-br-none shadow-md shadow-black/10"
                        : "bg-zinc-900 text-zinc-100 border border-zinc-800/60 rounded-bl-none"
                    }`}>
                      <p>{msg.text}</p>
                    </div>

                    {/* Minimalist Micro Action Tool Overlay */}
                    {isMe && !msg.id.startsWith("temp-") && (
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-zinc-900 text-zinc-600 hover:text-red-400 transition-all duration-150 transform translate-y-[-2px]"
                        title="Delete Message"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                  {/* High Contrast Precise Metadata Timing */}
                  <span className={`text-[9px] text-zinc-600 mt-1.5 px-2 font-bold tracking-widest uppercase ${isMe ? "text-right" : "text-left"}`}>
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                  </span>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Styled Input Footer */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-900 bg-zinc-950 flex gap-2 items-center">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type a secure message..."
          className="flex-1 bg-zinc-900/60 border border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-all duration-200 backdrop-blur-md"
        />
        <button
          type="submit"
          disabled={loading || !inputMessage.trim()}
          className="bg-zinc-100 hover:bg-zinc-50 disabled:bg-zinc-900 text-zinc-950 disabled:text-zinc-600 p-3 rounded-xl transition-all duration-200 shadow-xl flex items-center justify-center transform active:scale-95"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}