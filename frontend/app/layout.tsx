import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "AI Text Detector",
  description: "Detect AI-generated content with machine learning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`min-h-screen bg-background ${geistSans.variable} ${geistMono.variable}`}>
        <div className="flex min-h-screen flex-col">
          <header className="border-b">
            <div className="container flex h-16 items-center justify-between py-4">
              <h1 className="text-xl font-bold"></h1>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t py-4">
            <div className="container flex justify-center text-sm text-muted-foreground">
              
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}