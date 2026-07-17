import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { isClerkConfigured, signInPath, signUpPath } from "@/lib/auth";
import { isConvexConfigured } from "@/lib/convex";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1254,
        height: 1254,
        alt: "Denominated logo and purchasing-power brand card",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
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
  const clerkConfigured = isClerkConfigured();
  const convexConfigured = isConvexConfigured();
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const page =
    clerkConfigured && convexConfigured && convexUrl ? (
      <ConvexClientProvider url={convexUrl}>{children}</ConvexClientProvider>
    ) : (
      children
    );
  const app = (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {page}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
  if (!clerkConfigured) {
    return app;
  }

  return (
    <ClerkProvider signInUrl={signInPath} signUpUrl={signUpPath}>
      {app}
    </ClerkProvider>
  );
}
