import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kids Life School | Nurturing Bright Futures",
  description: "Welcome to Kids Life School - A vibrant learning environment focused on academic excellence and holistic development.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/assets/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#ffffff" />

        <title>Kids Life School | Nurturing Bright Futures</title>
        <meta name="description" content="" />
        <meta name="keywords" content="school, kids school, education, learning, kids life school, primary education, junior school, academics" />
        <meta name="author" content="Kids Life School" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <meta property="og:title" content="Kids Life School | Nurturing Bright Futures" />
        <meta property="og:description" content="Explore an inspiring and child-friendly environment at Kids Life School." />
        <meta property="og:image" content="/assets/og-image.jpg" />
        <meta property="og:url" content="https://yourdomain.com" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Kids Life School" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Kids Life School | Nurturing Bright Futures" />
        <meta name="twitter:description" content="Join a school where curiosity is encouraged and creativity is nurtured." />
        <meta name="twitter:image" content="/assets/og-image.jpg" />
        <meta name="twitter:creator" content="@KidsLifeSchool" />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster position="top-right" richColors />
        {children}
      </body>
    </html>
  );
}
