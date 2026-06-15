import type { Metadata, Viewport } from "next";
import "./globals.css";
import { TawkTo } from "@/components/integrations/TawkTo";
import { ProfileProvider } from "@/lib/profile";
import { ChatSettingsProvider } from "@/lib/chat-settings";

export const metadata: Metadata = {
  title: "NicheLead AI — by Genzic.AI",
  description:
    "Niche-specific lead discovery, AI scoring, and automated outreach. Built for Personal Trainers, Estheticians, Roofing Contractors, and Realtors.",
  applicationName: "NicheLead AI",
  authors: [{ name: "Genzic.AI" }],
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <ProfileProvider>
          <ChatSettingsProvider>
            {children}
            <TawkTo />
          </ChatSettingsProvider>
        </ProfileProvider>
      </body>
    </html>
  );
}
