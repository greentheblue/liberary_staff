"use client";

import { Sidebar } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <main className="lg:pl-64 min-h-screen">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}