import React from "react";
import { Toaster } from "@/components/ui/sonner";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black dark">
      <Toaster />
      <main>{children}</main>
    </div>
  );
}