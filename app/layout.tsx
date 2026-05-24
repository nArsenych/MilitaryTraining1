import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ToasterProvider from "@/components/providers/ToasterProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import ScrollToTop from "@/components/custom/ScrollToTop";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "MilitaryTraining",
  description: "Вебзастосунок для пошуку та запису на офлайн-курси військової підготовки",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ScrollToTop />
          <ToasterProvider />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
