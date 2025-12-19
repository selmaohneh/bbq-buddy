import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";
import SupabaseProvider from "./supabase-provider";
import { ProfileProvider } from "@/components/ProfileProvider";
import { ClientToaster } from "@/components/ClientToaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BBQ Buddy",
  description: "Never Forget a BBQ",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BBQ Buddy",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#D64933",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SupabaseProvider>
          <ProfileProvider>
            <Navbar />
            <main className="flex flex-col items-center min-h-screen">
              {children}
            </main>
            <ClientToaster />
          </ProfileProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
