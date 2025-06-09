import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link"; // <-- Import Link
import { ThemeProvider } from "@/components/theme-provider";
import { ContextualNavbar } from "@/components/navbar";
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

          <ContextualNavbar />
          
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