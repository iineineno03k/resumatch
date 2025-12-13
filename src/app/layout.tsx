import { ClerkProvider } from "@clerk/nextjs";
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
  title: "ResuMatch",
  description: "AI-powered resume matching for recruiters",
};

/**
 * モック認証が有効かどうか
 */
function isAuthMockEnabled(): boolean {
  return process.env.USE_AUTH_MOCK === "true";
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const body = (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );

  // モックモードの場合は ClerkProvider をスキップ
  if (isAuthMockEnabled()) {
    return body;
  }

  return <ClerkProvider>{body}</ClerkProvider>;
}
