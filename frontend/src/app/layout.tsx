import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BiasLens AI — Fairness Auditing Platform",
  description:
    "AI-powered platform to detect, explain, and fix bias in datasets and machine learning models. Audit fairness, generate compliance reports, and simulate the real-world impact of algorithmic bias.",
  keywords: ["AI fairness", "bias detection", "algorithmic bias", "ML auditing", "ethical AI", "fairness metrics"],
  authors: [{ name: "BiasLens AI" }],
  openGraph: {
    title: "BiasLens AI — Fairness Auditing Platform",
    description: "Detect, explain, and fix bias in your AI systems.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <div className="sidebar-layout bg-grid" style={{ backgroundColor: "#0a0a0f" }}>
          <Sidebar />
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
