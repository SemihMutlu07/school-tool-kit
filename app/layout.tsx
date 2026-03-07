import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Madlen AI Toolkit — AI Tools for Teachers & Students",
  description:
    "Three AI-powered tools for K-12 educators and students: Lesson Prep Assistant, Essay Grader, and Student Chatbot. Built for Madlen.",
  keywords:
    "AI education, lesson plan generator, essay grader, student chatbot, K-12 teacher tools, EdTech",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${plusJakarta.variable} ${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
