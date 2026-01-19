import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Space_Grotesk, Inter } from "next/font/google";
import { AuthProvider } from "@/components/providers/auth-provider";
import { OfflineIndicator } from "@/components/shell/OfflineIndicator";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Jalanea Works - Job Search for Orlando",
    template: "%s | Jalanea Works"
  },
  description: "Find jobs in Orlando with LYNX bus routes, scam protection, and AI-powered career coaching. Built for Valencia College graduates.",
  keywords: ["jobs", "Orlando", "Valencia College", "LYNX", "career", "job search", "Florida"],
  authors: [{ name: "Jalanea Works" }],
  creator: "Jalanea Works",
  publisher: "Jalanea Works",
  // PWA manifest
  manifest: "/manifest.json",
  // Apple PWA meta tags
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "JalaneaWorks",
  },
  // Favicons and icons
  icons: {
    icon: [
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Jalanea Works",
    title: "Jalanea Works - Job Search for Orlando",
    description: "Find jobs in Orlando with LYNX bus routes, scam protection, and AI-powered career coaching."
  },
  twitter: {
    card: "summary_large_image",
    title: "Jalanea Works - Job Search for Orlando",
    description: "Find jobs in Orlando with LYNX bus routes, scam protection, and AI-powered career coaching."
  },
  robots: {
    index: true,
    follow: true
  }
};

export const viewport: Viewport = {
  // Gold primary color for PWA status bar
  themeColor: "#ffc425",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${inter.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <OfflineIndicator />
          <main id="main-content">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
