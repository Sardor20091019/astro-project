"use client";
import { deleteComment } from "@/app/actions/admin";
import { Trash2 } from "lucide-react";

export function AdminCommentDelete({ commentId }: { commentId: number }) {
  return (
    <button 
      onClick={() => deleteComment(commentId)}
      className="text-red-500/50 hover:text-red-500 transition-colors"
      title="Delete Comment"
    >
      <Trash2 size={12} />
    </button>
  );
}