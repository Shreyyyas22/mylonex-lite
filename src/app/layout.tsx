import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/providers";
import { Navbar } from "@/components/layout/navbar";
import { ToastProvider } from "@/components/ui/toast";
import { QuoteNotifier } from "@/components/realtime/quote-notifier";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MyloNex Lite - B2B Textile Sourcing",
  description: "RFQ Marketplace for textiles",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white min-h-screen`}>
        <Providers>
          <ToastProvider>
            <Navbar />
            <QuoteNotifier />
            <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
