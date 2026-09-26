import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "Hotel Larasati", template: "%s | Hotel Larasati" },
  description: "Hotel Larasati staff management system",
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
