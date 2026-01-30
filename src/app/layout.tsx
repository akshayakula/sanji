import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { GoogleMapsProvider } from "@/lib/google-maps";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashwill — Snap. Match. Deliver.",
  description:
    "Donate extra food or supplies by snapping a photo. Dashwill finds nearby shelters, and sends a courier instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-[#FAFAFA]`}
      >
        <GoogleMapsProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
        </GoogleMapsProvider>
      </body>
    </html>
  );
}
