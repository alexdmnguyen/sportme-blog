// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link"; // <-- Import Link
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SAMBO'S SACKED SLOG",
  description: "IM PHIN!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-50`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <header className="sticky top-0 z-50 bg-white dark:bg-slate-800/70 dark:backdrop-blur-lg dark:border-b dark:border-slate-700 shadow-lg">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold text-indigo-600 hover:text-indigo-800">
                SAMBO NEWS
              </Link>
              <div className="space-x-4">
                <Link href="/" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                  Home
                </Link>
                <Link href="/articles" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                  All Articles
                </Link>
                <Link href="/esports" className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary-hover px-3 py-2 rounded-md text-sm font-medium">
                  Esports Hub
                </Link>
                {/* <ThemeSwitcher /> */}
              </div>
            </nav>
          </header>
          
          <div className="min-h-screen">
            {children}
          </div>

          <footer className="bg-slate-800 dark:bg-slate-950 text-slate-300 text-center p-4 sm:p-6 mt-12">
            <p>&copy; {new Date().getFullYear()} Sambo's Blog. All rights reserved.</p>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}