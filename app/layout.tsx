import type { Metadata } from "next";
import { Inter, Dancing_Script } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const dancingScript = Dancing_Script({ subsets: ["latin"], variable: "--font-dancing" });

export const metadata: Metadata = {
  title: "Faruk Hasan - QA Engineer & Automation Specialist",
  description: "Portfolio of Faruk Hasan, a QA Engineer specializing in automation testing, CI/CD, and AI-driven testing strategies.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className={`${inter.variable} ${dancingScript.variable} font-sans antialiased min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col`}>
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
