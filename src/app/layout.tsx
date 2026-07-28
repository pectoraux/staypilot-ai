import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StayPilot AI — Revenue Operating System for Guest Houses",
  description:
    "StayPilot AI is an AI-powered Revenue Operating System that keeps every room occupied, reduces OTA commissions, and grows direct bookings for guest houses and boutique hotels.",
  keywords: [
    "StayPilot AI",
    "guest house software",
    "hotel revenue management",
    "direct bookings",
    "OTA management",
    "AI hospitality",
  ],
  authors: [{ name: "StayPilot AI" }],
  icons: { icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg" },
  openGraph: {
    title: "StayPilot AI — Revenue Operating System for Guest Houses",
    description:
      "AI Chief Revenue Officer that works 24/7 to fill rooms, cut OTA commissions, and grow direct bookings.",
    siteName: "StayPilot AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StayPilot AI",
    description:
      "AI Chief Revenue Officer that works 24/7 to fill rooms and grow direct bookings.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
