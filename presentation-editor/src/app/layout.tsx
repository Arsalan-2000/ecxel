import type { Metadata } from "next";
import { Geist, Geist_Mono, Vazirmatn } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ویرایشگر ارائه - طراحی اسلاید و خروجی PDF/PPTX",
  description:
    "ویرایشگر آنلاین برای طراحی صفحات ارائه: نوشتن متن، افزودن تصویر، تعیین موقعیت و اندازه، و خروجی PDF و PowerPoint.",
  keywords: [
    "presentation editor",
    "slide maker",
    "PDF export",
    "PowerPoint export",
    "pptx",
    "ویرایشگر ارائه",
    "طراحی اسلاید",
  ],
  authors: [{ name: "Z.ai" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${vazirmatn.variable} antialiased bg-background text-foreground font-vazirmatn`}
        style={{ fontFamily: "var(--font-vazirmatn), var(--font-geist-sans), system-ui, sans-serif" }}
      >
        {children}
        <Toaster />
        <SonnerToaster position="top-center" richColors />
      </body>
    </html>
  );
}
