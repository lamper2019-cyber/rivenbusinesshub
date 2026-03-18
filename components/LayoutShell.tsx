"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import BottomTabBar from "./BottomTabBar";

const CLIENT_FACING_ROUTES = ["/checkin", "/onboarding"];

export default function LayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isClientFacing = CLIENT_FACING_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (isClientFacing) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen">
      <Sidebar />
      <BottomTabBar />
      <main className="md:ml-64 p-4 md:p-8 pb-24 md:pb-8">{children}</main>
    </div>
  );
}
