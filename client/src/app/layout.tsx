import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Providers } from "./providers";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { Toaster } from "@/components/ui/sonner"
import { ourFileRouter } from "@/app/api/uploadthing/core";
import { CameraProvider } from "@/components/ui/camera/camera-provider";

export const metadata: Metadata = {
  title: "Credify | Video Authenticity & Attribution Service",
  description: "Detect tampered videos and trace video origins with Credify. Our cutting-edge technology ensures media integrity and helps combat misinformation.",
  keywords: "video authentication, deepfake detection, video attribution, media integrity, misinformation, content verification",
  openGraph: {
    title: "Credify - Ensuring Video Authenticity in the Digital Age",
    description: "Protect yourself from manipulated media. Credify offers state-of-the-art video tampering detection and source attribution services.",
    // images: [{ url: "/og-image.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Credify | Video Authentication & Attribution",
    description: "Detect tampered videos and trace their origins with Credify's advanced technology.",
    // images: ["/twitter-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-hidden scrollbar-hide">
      <body className={GeistSans.className}>
        <NextSSRPlugin
          routerConfig={extractRouterConfig(ourFileRouter)}
        />
        <Providers>
          <CameraProvider>{children}</CameraProvider>
        </Providers>
        <Toaster /></body>
    </html>
  );
}