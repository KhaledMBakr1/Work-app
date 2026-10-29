import type { Metadata, Viewport } from "next";
import { getI18n } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: "WorkDays",
  description: "Track the days workers worked each month",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { lang, dir } = await getI18n();
  return (
    <html lang={lang} dir={dir}>
      <body>{children}</body>
    </html>
  );
}
