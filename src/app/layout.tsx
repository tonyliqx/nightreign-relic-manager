import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "遗物配装搜索",
  description: "Nightreign 遗物配装优化器和图鉴",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-white text-black dark:bg-black dark:text-white`}> 
        <header className="border-b border-black/10 dark:border-white/10">
          <nav className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="font-semibold tracking-tight">遗物配装搜索</Link>
            <ul className="flex gap-6 text-sm">
              <li><Link className="hover:underline underline-offset-4" href="/builds">配装</Link></li>
              <li><Link className="hover:underline underline-offset-4" href="/compendium">图鉴</Link></li>
              <li><Link className="hover:underline underline-offset-4" href="/my-relics">我的遗物</Link></li>
              <li><Link className="hover:underline underline-offset-4" href="/search">搜索</Link></li>
            </ul>
          </nav>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
