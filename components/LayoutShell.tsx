"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

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
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  );
}
