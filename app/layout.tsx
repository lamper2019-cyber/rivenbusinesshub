import type { Metadata, Viewport } from "next";
import "./globals.css";
import LayoutShell from "@/components/LayoutShell";
import ServiceWorker from "@/components/ServiceWorker";

export const metadata: Metadata = {
  title: "RIVEN Business Hub",
  description: "Business management dashboard for RIVEN",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "RIVEN Hub",
  },
  icons: {
    icon: "/api/icon?size=32",
    apple: "/api/icon?size=180",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-riven-bg text-white antialiased">
        <ServiceWorker />
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
