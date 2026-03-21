"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/clients", label: "Clients", icon: "group" },
  { href: "/leads", label: "Leads", icon: "target" },
  { href: "/chat", label: "Chat", icon: "chat" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-riven-card flex-col z-50">
      <div className="p-6">
        <h1 className="text-2xl font-headline font-bold tracking-tight">
          <span className="text-riven-gold">RIVEN</span>{" "}
          <span className="text-white/60 text-lg font-normal">CRM</span>
        </h1>
      </div>
      <nav className="flex-1 py-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 text-sm transition-all ${
                isActive
                  ? "text-riven-gold bg-riven-gold/10 border-r-2 border-riven-gold"
                  : "text-riven-muted hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-6">
        <p className="text-xs text-riven-muted/60">RIVEN CRM v2.0</p>
      </div>
    </aside>
  );
}
