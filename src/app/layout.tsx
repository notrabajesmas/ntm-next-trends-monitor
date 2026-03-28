import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#10B981" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "NTM - Next Trends Monitor | Tu kit completo de análisis digital",
    template: "%s | NTM",
  },
  description: "Descubre oportunidades de negocio, detecta tendencias emergentes y audita la presencia digital de cualquier empresa. Todo automatizado con IA.",
  keywords: ["análisis de mercado", "tendencias", "oportunidades de negocio", "auditoría digital", "IA", "automatización", "business intelligence"],
  authors: [{ name: "NTM Team" }],
  creator: "NTM",
  publisher: "NTM",
  
  // Favicon and icons
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  
  // PWA
  manifest: "/manifest.json",
  
  // Open Graph / Facebook
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "https://ntm-next-trends-monitor.vercel.app",
    siteName: "NTM - Next Trends Monitor",
    title: "NTM - Next Trends Monitor | Tu kit completo de análisis digital",
    description: "Descubre oportunidades de negocio, detecta tendencias emergentes y audita la presencia digital. Todo automatizado con IA.",
    images: [
      {
        url: "/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "NTM Logo",
      },
    ],
  },
  
  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "NTM - Next Trends Monitor",
    description: "Tu kit completo de análisis digital automatizado con IA",
    images: ["/icon-512x512.png"],
  },
  
  // App info
  applicationName: "NTM",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NTM",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
