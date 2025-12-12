"use client";

import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Main Content Area */}
      <div className="flex-1">
        {/* Page Content */}
        <div className="mx-auto w-full max-w-none px-4 sm:px-6 lg:px-8">{children}</div>
      </div>
    </div>
  );
}
