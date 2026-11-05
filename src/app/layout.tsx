import type { Metadata } from "next";
import localFont from "next/font/local";
import { Navbar } from "@/components/layout/navbar";
import { NavigationProgress } from "@/components/layout/navigation-progress";
import { Footer } from "@/components/layout/footer";
import { PageTransition } from "@/components/layout/page-transition";
import { MotionProvider } from "@/components/animation/motion-provider";
import { SessionProvider } from "@/components/layout/session-provider";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { ToastProvider } from "@/components/ui/toast-provider";
import { siteConfig } from "@/config/site";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} — stories worth sharing`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <MotionProvider>
            <SessionProvider>
              <ToastProvider>
                <NavigationProgress />
                <Navbar />
                <div className="flex min-h-[calc(100vh-4rem)] flex-1 flex-col">
                  <PageTransition>{children}</PageTransition>
                  <Footer />
                </div>
              </ToastProvider>
            </SessionProvider>
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
