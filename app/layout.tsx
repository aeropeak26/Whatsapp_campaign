import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WhatsApp Blast - Campaign Manager & Meta API Dispatcher",
  description: "Send WhatsApp marketing campaigns with Next.js, Meta WhatsApp Business Cloud API, Tailwind CSS, and Supabase.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-dark-bg text-gray-100 min-h-screen selection:bg-brand-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
