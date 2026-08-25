"use client";

import { useState } from "react";
import { Users, MessageSquare, X, ChevronLeft, ChevronRight } from "lucide-react";
import DeleteUserButton from "@/components/DeleteUserButton";
import { AdminCommentDelete } from "@/components/AdminCommentDelete";

interface UserItem {
  id: string;
  name: string | null;
  email: string | null;
}

interface CommentItem {
  id: number; // <-- Fixed here (changed from string to number)
  body: string;
  createdAt: Date;
  user: {
    name: string | null;
  } | null;
}

interface AdminDashboardModalsProps {
  users: UserItem[];
  comments: CommentItem[];
  currentUserId: string;
}

export default function AdminDashboardModals({ users, comments, currentUserId }: AdminDashboardModalsProps) {
  const [activeModal, setActiveModal] = useState<"users" | "comments" | null>(null);
  
  // Pagination States
  const [userPage, setUserPage] = useState(1);
  const [commentPage, setCommentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  // Paginated data slices
  const totalUserPages = Math.ceil(users.length / ITEMS_PER_PAGE) || 1;
  const paginatedUsers = users.slice((userPage - 1) * ITEMS_PER_PAGE, userPage * ITEMS_PER_PAGE);

  const totalCommentPages = Math.ceil(comments.length / ITEMS_PER_PAGE) || 1;
  const paginatedComments = comments.slice((commentPage - 1) * ITEMS_PER_PAGE, commentPage * ITEMS_PER_PAGE);

  return (
    <>
      {/* Secondary Bento Grid Cards with Trigger Buttons */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Users Card Preview */}
        <div className="w-full bg-(--surface) border border-(--border) rounded-[2.5rem] p-6 sm:p-8 backdrop-blur-3xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-(--accent)/10 border border-(--accent)/30 text-(--accent)">
                  <Users size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-widest text-(--text)">User Directory</h2>
                  <p className="text-[11px] text-(--text-dim)">Registered platform accounts</p>
                </div>
              </div>
              <span className="text-xs font-mono text-(--text-dim) bg-(--surface-2) px-3 py-1 rounded-full border border-(--border)">
                {users.length} Total
              </span>
            </div>
            <p className="text-xs text-(--text-dim) mb-6">
              View, inspect, and manage registered accounts with pagination and quick search controls.
            </p>
          </div>
          <button
            onClick={() => { setUserPage(1); setActiveModal("users"); }}
            className="w-full py-3.5 px-5 rounded-2xl bg-(--surface-2) hover:bg-(--surface-3) border border-(--border) font-mono text-xs font-bold uppercase tracking-wider text-(--text) transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Manage All Users</span>
          </button>
        </div>

        {/* Comments Card Preview */}
        <div className="w-full bg-(--surface) border border-(--border) rounded-[2.5rem] p-6 sm:p-8 backdrop-blur-3xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-(--accent)/10 border border-(--accent)/30 text-(--accent)">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-widest text-(--text)">Community Log</h2>
                  <p className="text-[11px] text-(--text-dim)">Live feed of visitor commentary</p>
                </div>
              </div>
              <span className="text-xs font-mono text-(--text-dim) bg-(--surface-2) px-3 py-1 rounded-full border border-(--border)">
                {comments.length} Entries
              </span>
            </div>
            <p className="text-xs text-(--text-dim) mb-6">
              Review and moderate visitor feedback and discussions across photo exhibits.
            </p>
          </div>
          <button
            onClick={() => { setCommentPage(1); setActiveModal("comments"); }}
            className="w-full py-3.5 px-5 rounded-2xl bg-(--surface-2) hover:bg-(--surface-3) border border-(--border) font-mono text-xs font-bold uppercase tracking-wider text-(--text) transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Manage All Comments</span>
          </button>
        </div>

      </div>

      {/* USERS MODAL */}
      {activeModal === "users" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-(--surface) border border-(--border) rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-(--border)">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-(--accent)/10 border border-(--accent)/30 text-(--accent)">
                  <Users size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold uppercase tracking-tight text-(--text)">User Directory</h3>
                  <p className="text-[11px] text-(--text-dim) font-mono">Showing page {userPage} of {totalUserPages} ({users.length} total users)</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="w-9 h-9 rounded-full bg-(--surface-2) hover:bg-(--surface-3) border border-(--border) flex items-center justify-center text-(--text-dim) hover:text-(--text) transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body / User List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {paginatedUsers.map((u) => (
                <div 
                  key={u.id} 
                  className="flex items-center justify-between p-4 rounded-2xl bg-(--surface-2) border border-(--border) hover:border-(--border-hover) transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0 pr-4">
                    <div className="w-10 h-10 rounded-xl bg-(--surface-3) border border-(--border) flex items-center justify-center font-bold text-xs text-(--text) shrink-0 uppercase">
                      {u.name ? u.name[0] : "U"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-(--text) text-xs truncate">
                        {u.name || "Unnamed User"} {u.id === currentUserId && "(You)"}
                      </p>
                      <p className="text-(--text-dim) text-[11px] font-mono truncate mt-0.5">{u.email || "No Email Provided"}</p>
                    </div>
                  </div>
                  {u.id !== currentUserId && (
                    <div className="shrink-0">
                      <DeleteUserButton userId={u.id} userName={u.name || "User"} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination Footer */}
            {totalUserPages > 1 && (
              <div className="flex items-center justify-between pt-4 mt-6 border-t border-(--border)">
                <button
                  onClick={() => setUserPage(p => Math.max(p - 1, 1))}
                  disabled={userPage === 1}
                  className="px-4 py-2 rounded-xl bg-(--surface-2) border border-(--border) text-xs font-mono uppercase tracking-wider text-(--text) disabled:opacity-40 disabled:cursor-not-allowed hover:bg-(--surface-3) transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                <span className="text-xs font-mono text-(--text-dim)">
                  Page {userPage} of {totalUserPages}
                </span>
                <button
                  onClick={() => setUserPage(p => Math.min(p + 1, totalUserPages))}
                  disabled={userPage === totalUserPages}
                  className="px-4 py-2 rounded-xl bg-(--surface-2) border border-(--border) text-xs font-mono uppercase tracking-wider text-(--text) disabled:opacity-40 disabled:cursor-not-allowed hover:bg-(--surface-3) transition-all cursor-pointer flex items-center gap-1.5"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* COMMENTS MODAL */}
      {activeModal === "comments" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-(--surface) border border-(--border) rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-(--border)">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-(--accent)/10 border border-(--accent)/30 text-(--accent)">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold uppercase tracking-tight text-(--text)">Community Log</h3>
                  <p className="text-[11px] text-(--text-dim) font-mono">Showing page {commentPage} of {totalCommentPages} ({comments.length} total comments)</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="w-9 h-9 rounded-full bg-(--surface-2) hover:bg-(--surface-3) border border-(--border) flex items-center justify-center text-(--text-dim) hover:text-(--text) transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body / Comment List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {paginatedComments.map((c) => (
                <div 
                  key={c.id} 
                  className="flex items-start justify-between p-4 rounded-2xl bg-(--surface-2) border border-(--border) hover:border-(--border-hover) gap-4 transition-all"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <span className="font-semibold text-(--text) text-xs truncate">
                        {c.user?.name || "Unknown User"}
                      </span>
                      <span className="text-[10px] font-mono text-(--text-muted) shrink-0">
                        {new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-(--text-dim) text-xs break-words leading-relaxed">
                      {c.body}
                    </p>
                  </div>
                  <div className="shrink-0 pt-0.5">
                    <AdminCommentDelete commentId={c.id} />
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Footer */}
            {totalCommentPages > 1 && (
              <div className="flex items-center justify-between pt-4 mt-6 border-t border-(--border)">
                <button
                  onClick={() => setCommentPage(p => Math.max(p - 1, 1))}
                  disabled={commentPage === 1}
                  className="px-4 py-2 rounded-xl bg-(--surface-2) border border-(--border) text-xs font-mono uppercase tracking-wider text-(--text) disabled:opacity-40 disabled:cursor-not-allowed hover:bg-(--surface-3) transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                <span className="text-xs font-mono text-(--text-dim)">
                  Page {commentPage} of {totalCommentPages}
                </span>
                <button
                  onClick={() => setCommentPage(p => Math.min(p + 1, totalCommentPages))}
                  disabled={commentPage === totalCommentPages}
                  className="px-4 py-2 rounded-xl bg-(--surface-2) border border-(--border) text-xs font-mono uppercase tracking-wider text-(--text) disabled:opacity-40 disabled:cursor-not-allowed hover:bg-(--surface-3) transition-all cursor-pointer flex items-center gap-1.5"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}