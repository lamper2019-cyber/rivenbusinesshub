import type { Metadata } from "next";
import "./globals.css";
import LayoutShell from "@/components/LayoutShell";

export const metadata: Metadata = {
  title: "RIVEN Business Hub",
  description: "Business management dashboard for RIVEN",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-riven-bg text-white antialiased">
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
