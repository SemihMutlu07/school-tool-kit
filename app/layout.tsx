import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Toolkit — AI Tools for Teachers & Students",
  description:
    "Three AI-powered tools for K-12 educators and students: Lesson Prep Assistant, Essay Grader, and Student Chatbot.",
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
