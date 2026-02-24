import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

export const dynamic = 'force-dynamic';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Habit Pool | Earn Money Building Habits",
  description: "Join performance-based habit challenges. Pledge money and complete your habits. The pledges of failing members are distributed to successful teammates.",
  keywords: ["habit tracker", "habit app", "earn money", "challenge pool", "habit pool", "performance-based"],
  openGraph: {
    title: "Habit Pool | Earn Money Building Habits",
    description: "Join performance-based habit challenges. Pledge money and complete your habits to earn rewards.",
    url: "https://habitpool.site",
    siteName: "Habit Pool",
    images: [
      {
        url: "https://habitpool.site/og-image.png",
        width: 1200,
        height: 630,
        alt: "Habit Pool Preview Image",
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Habit Pool | Earn Money Building Habits",
    description: "Commit to your habits with a financial pledge. Succeed and earn from the failure pool!",
    images: ["https://habitpool.site/og-image.png"],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-background font-sans antialiased text-foreground`}>
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
