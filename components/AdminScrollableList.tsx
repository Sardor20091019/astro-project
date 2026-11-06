"use client";

import React from "react";

interface AdminScrollableListProps {
  children: React.ReactNode;
}

export default function AdminScrollableList({ children }: AdminScrollableListProps) {
  return (
    <div 
      className="flex-1 min-h-0 overflow-y-auto pr-2 space-y-2.5 custom-scrollbar"
      style={{ overscrollBehavior: "contain" }}
    >
      {children}
    </div>
  );
}