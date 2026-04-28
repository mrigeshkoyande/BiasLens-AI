import type { Metadata } from "next";
import { Epilogue } from "next/font/google";
import "./globals.css";
import TopNav from "@/components/layout/TopNav";
import Sidebar from "@/components/layout/Sidebar";
import ChatPanel from "@/components/chat/ChatPanel";
import { PipelineProvider } from "@/lib/pipeline";
import { AuthProvider } from "@/lib/auth";
import LayoutWrapper from "@/components/layout/LayoutWrapper";

const epilogue = Epilogue({
  variable: "--font-epilogue",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BiasLens AI — Fairness Auditing Platform",
  description:
    "AI-powered platform to detect, explain, and fix bias in datasets and machine learning models.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#fff8d9" />
        <link rel="icon" href="/logo.png" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className={`${epilogue.variable} font-epilogue antialiased`}>
        <AuthProvider>
          <PipelineProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
          </PipelineProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
