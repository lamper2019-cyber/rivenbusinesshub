"use client";

import Sidebar from "./Sidebar";
import BottomTabBar from "./BottomTabBar";

export default function LayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <BottomTabBar />
      <main className="md:ml-64 p-4 md:p-8 pb-24 md:pb-8">{children}</main>
    </div>
  );
}
