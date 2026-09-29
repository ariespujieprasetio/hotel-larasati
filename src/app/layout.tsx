import type { Metadata } from "next";
import { cookies } from "next/headers";
import { LanguageProvider } from "@/components/i18n/language-provider";
import { localeCookie, parseLocale } from "@/lib/i18n/messages";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "Hotel Larasati", template: "%s | Hotel Larasati" },
  description: "Hotel Larasati staff management system",
  robots: { index: false, follow: false },
};
export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = parseLocale((await cookies()).get(localeCookie)?.value);
  return (
    <html lang={locale}>
      <body className="min-h-screen antialiased">
        <LanguageProvider locale={locale}>{children}</LanguageProvider>
      </body>
    </html>
  );
}
