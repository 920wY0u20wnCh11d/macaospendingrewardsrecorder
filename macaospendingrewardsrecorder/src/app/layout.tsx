import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Macao Lucky Draw Recorder",
  description: "Manage and track your lucky draw awards with automatic expiry calculation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
