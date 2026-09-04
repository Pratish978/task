// src/app/layout.tsx
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Chatbot from "@/components/CareAssistant";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Schedula - Healthcare Management Platform",
  description: "Modern digital healthcare management and appointments platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakarta.variable} font-sans antialiased`}>
      <body 
        suppressHydrationWarning 
        className="bg-[#FAF9F6] text-stone-900 min-h-screen flex flex-col selection:bg-stone-900 selection:text-white"
      >
        {children}
        <Chatbot />
      </body>
    </html>
  );
}