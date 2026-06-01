"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { MessageCircle, Trash2 } from "lucide-react";
import { isAdmin } from "@/lib/admin";

type CommentItem = {
  id: number;
  body?: string;
  comment?: string;
  userId?: string;
  user: {
    name: string | null;
    image: string | null;
    customImage?: string | null;
  };
};

export default function ReviewList({ photoId, refreshTrigger }: { photoId: number; refreshTrigger: number }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const admin = isAdmin(session?.user?.email);

  const fetchComments = useCallback(async () => {
    const res = await fetch(`/api/comments?photoId=${photoId}`);
    const data = await res.json();
    setComments(Array.isArray(data) ? data : []);
  }, [photoId]);

  useEffect(() => {
    void Promise.resolve().then(fetchComments);
  }, [fetchComments, refreshTrigger]);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this comment?")) return;
    const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
    if (res.ok) fetchComments();
  };

  if (comments.length === 0) {
    return <p className="text-sm text-zinc-500">No comments yet.</p>;
  }

  return (
    <div className="mt-6 space-y-5">
      {comments.map((item) => (
        <div key={item.id} className="group border-b border-white/5 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-3">
              <img
                src={item.user.customImage || item.user.image || "/default-pfp.png"}
                alt=""
                className="h-8 w-8 rounded-full border border-zinc-800 object-cover"
              />
              <div>
                <p className="text-sm font-bold text-white">{item.user.name || "Gallery visitor"}</p>
                <p className="mt-1 flex items-start gap-2 text-sm text-zinc-400">
                  <MessageCircle className="mt-0.5 shrink-0 text-red-500" size={13} />
                  {item.body ?? item.comment}
                </p>
              </div>
            </div>

            {/* Admin can delete any comment */}
            {admin && (
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="rounded-full p-2 text-zinc-600 opacity-0 transition hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
