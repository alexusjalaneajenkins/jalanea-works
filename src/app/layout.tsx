import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Space_Grotesk, Inter } from "next/font/google";
import { AuthProvider } from "@/components/providers/auth-provider";
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1f2937" }
  ],
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${inter.variable} antialiased`}
      >
        <AuthProvider>
          <main id="main-content">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
