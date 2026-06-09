/* eslint-disable @typescript-eslint/no-unused-expressions */
"use client";
import { useState, useMemo } from "react";
import Image from "next/image";
import { Trash2, Search, Edit3, Check, X, ChevronDown } from "lucide-react";
import { CATEGORIES } from "@/data/photos";

interface Photo {
  id: number;
  url: string;
  title: string;
  category?: string | null;
  location?: string | null;
  createdAt?: Date | string;
}

export default function AdminPhotoList({ initialPhotos }: { initialPhotos: Photo[] }) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string>("ALL");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

  const filtered = useMemo(() => {
    return photos.filter(p => {
      const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.location || "").toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCat === "ALL" || (p.category || "OTHER") === filterCat;
      return matchSearch && matchCat;
    });
  }, [photos, search, filterCat]);

  async function deletePhoto(id: number) {
    if (!confirm("Delete this photo permanently?")) return;
    setDeletingIds(s => new Set([...s, id]));
    const res = await fetch(`/api/photos/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPhotos(p => p.filter(x => x.id !== id));
      setSelected(s => { const n = new Set(s); n.delete(id); return n; });
    } else {
      alert("Failed to delete.");
    }
    setDeletingIds(s => { const n = new Set(s); n.delete(id); return n; });
  }

  async function bulkDelete() {
    if (!confirm(`Delete ${selected.size} photos permanently?`)) return;
    const ids = [...selected];
    for (const id of ids) {
      const res = await fetch(`/api/photos/${id}`, { method: "DELETE" });
      if (res.ok) setPhotos(p => p.filter(x => x.id !== id));
    }
    setSelected(new Set());
  }

  async function saveTitle(id: number) {
    const res = await fetch(`/api/photos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle }),
    });
    if (res.ok) {
      setPhotos(p => p.map(x => x.id === id ? { ...x, title: editTitle } : x));
      setEditingId(null);
    } else {
      alert("Failed to update title.");
    }
  }

  const toggleSelect = (id: number) => {
    setSelected(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(p => p.id)));
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex-1 min-w-50 relative">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search photos..."
            className="w-full bg-zinc-900 border border-white/8 pl-8 pr-3 py-2.5 rounded-xl text-xs text-white outline-none focus:border-red-500/50 transition-all placeholder:text-zinc-600"
          />
        </div>

        {/* Category filter */}
        <div className="relative">
          <select
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
            className="appearance-none bg-zinc-900 border border-white/8 pl-3 pr-8 py-2.5 rounded-xl text-xs text-white outline-none focus:border-red-500/50 transition-all cursor-pointer"
          >
            <option value="ALL">All categories</option>
            {CATEGORIES.filter(c => c.value !== "ALL").map(cat => (
              <option key={cat.value} value={cat.value} className="bg-zinc-900">{cat.icon} {cat.label}</option>
            ))}
          </select>
          <ChevronDown size={10} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
        </div>

        {/* Bulk actions */}
        {selected.size > 0 && (
          <button
            onClick={bulkDelete}
            className="flex items-center gap-1.5 bg-red-600/20 text-red-400 border border-red-500/20 hover:bg-red-600 hover:text-white px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
          >
            <Trash2 size={11} />
            Delete {selected.size}
          </button>
        )}
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
          {filtered.length} of {photos.length} photos
        </p>
        <button
          onClick={toggleAll}
          className="text-[10px] text-zinc-500 hover:text-white uppercase tracking-widest font-bold transition-colors"
        >
          {selected.size === filtered.length && filtered.length > 0 ? "Deselect all" : "Select all"}
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {filtered.map(photo => {
          const isSelected = selected.has(photo.id);
          const isDeleting = deletingIds.has(photo.id);
          const isEditing = editingId === photo.id;

          return (
            <div
              key={photo.id}
              className={`group relative bg-zinc-900 rounded-xl overflow-hidden border transition-all duration-200 ${
                isSelected ? "border-red-500/60 ring-1 ring-red-500/20" : "border-white/5 hover:border-white/15"
              } ${isDeleting ? "opacity-40 pointer-events-none" : ""}`}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleSelect(photo.id)}
                className={`absolute top-2 left-2 z-10 w-5 h-5 rounded-md border transition-all ${
                  isSelected 
                    ? "bg-red-500 border-red-500" 
                    : "bg-black/50 border-white/20 opacity-0 group-hover:opacity-100"
                } flex items-center justify-center backdrop-blur-sm`}
              >
                {isSelected && <Check size={10} strokeWidth={3} />}
              </button>

              {/* Category tag */}
              {photo.category && photo.category !== "OTHER" && (
                <div className="absolute top-2 right-2 z-10">
                  <span className="text-[8px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-sm text-white/60 px-1.5 py-0.5 rounded-full border border-white/10">
                    {CATEGORIES.find(c => c.value === photo.category)?.icon}
                  </span>
                </div>
              )}

              {/* Image */}
              <div className="aspect-square relative">
                <Image
                  src={photo.url}
                  alt={photo.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Footer */}
              <div className="p-2.5">
                {isEditing ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && saveTitle(photo.id)}
                      autoFocus
                      className="flex-1 bg-black border border-red-500/40 text-white text-[10px] px-2 py-1 rounded-lg outline-none min-w-0"
                    />
                    <button onClick={() => saveTitle(photo.id)} className="text-green-500 hover:text-green-400 transition-colors shrink-0">
                      <Check size={13} />
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-zinc-500 hover:text-white transition-colors shrink-0">
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-[10px] uppercase font-bold truncate text-white/80">{photo.title}</span>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => { setEditingId(photo.id); setEditTitle(photo.title); }}
                        className="text-zinc-600 hover:text-white transition-colors"
                        title="Edit title"
                      >
                        <Edit3 size={11} />
                      </button>
                      <button
                        onClick={() => deletePhoto(photo.id)}
                        className="text-zinc-600 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-10 text-zinc-600 text-xs uppercase tracking-widest font-bold">
          No photos match your search
        </div>
      )}
    </div>
  );
}
