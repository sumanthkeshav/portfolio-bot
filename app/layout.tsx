import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Keshav — AI Product Manager",
  description:
    "Portfolio of Sumant Keshav — AI Product Manager with a background in fintech and proptech. Talk to AI Keshav directly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="bg-[#0a0a0a] text-white min-h-full flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
