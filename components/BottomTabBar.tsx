"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/clients", label: "Clients", icon: "group" },
  { href: "/leads", label: "Leads", icon: "target" },
  { href: "/chat", label: "Chat", icon: "chat" },
];

export default function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-riven-card md:hidden safe-bottom">
      <div className="flex h-16">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
                isActive
                  ? "text-riven-gold"
                  : "text-riven-muted hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-xl">{tab.icon}</span>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
