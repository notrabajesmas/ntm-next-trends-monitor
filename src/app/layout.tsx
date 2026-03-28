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
  description: "Descubre oportunidades de negocio, detecta tendencias emergentes y audita la presencia digital de cualquier empresa. Scanner de negocios, análisis de tendencias y auditorías digitales con inteligencia artificial. Exporta reportes profesionales en PDF y Excel.",
  keywords: [
    "análisis de mercado",
    "tendencias",
    "oportunidades de negocio",
    "auditoría digital",
    "IA",
    "automatización",
    "business intelligence",
    "scanner de negocios",
    "análisis de competencia",
    "reportes profesionales",
    "PDF",
    "Excel",
    "Google Places",
    "SEO",
    "presencia digital",
    "market analysis",
    "trend analysis",
    "business scanner",
    "digital audit",
  ],
  authors: [{ name: "NTM Team", url: "https://ntm.app" }],
  creator: "NTM",
  publisher: "NTM",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
  // Favicon and icons
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/logo-icon.png", color: "#10B981" },
    ],
  },
  
  // PWA
  manifest: "/manifest.json",
  
  // Open Graph / Facebook
  openGraph: {
    type: "website",
    locale: "es_AR",
    alternateLocale: ["en_US", "pt_BR"],
    url: "https://ntm.app",
    siteName: "NTM - Next Trends Monitor",
    title: "NTM - Next Trends Monitor | Tu kit completo de análisis digital",
    description: "Descubre oportunidades de negocio, detecta tendencias emergentes y audita la presencia digital. Scanner de negocios, análisis de tendencias y auditorías con IA. Exporta reportes PDF y Excel.",
    images: [
      {
        url: "/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "NTM - Next Trends Monitor Logo",
        type: "image/png",
      },
      {
        url: "/icon-192x192.png",
        width: 192,
        height: 192,
        alt: "NTM - Next Trends Monitor Logo Small",
        type: "image/png",
      },
    ],
    videos: [],
    audio: [],
  },
  
  // Twitter
  twitter: {
    card: "summary_large_image",
    site: "@ntm_app",
    creator: "@ntm_app",
    title: "NTM - Next Trends Monitor | Análisis Digital con IA",
    description: "Scanner de negocios, análisis de tendencias y auditorías digitales. Exporta reportes profesionales en PDF y Excel.",
    images: ["/icon-512x512.png"],
  },
  
  // App info
  applicationName: "NTM",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NTM",
    startupImage: ["/icon-512x512.png"],
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  
  // Additional metadata
  category: "business",
  classification: "Business Intelligence",
  referrer: "origin-when-cross-origin",
  
  // Verification (placeholder - user should add real IDs)
  verification: {
    google: "google-site-verification-code",
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
