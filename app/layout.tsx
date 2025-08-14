import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toaster";
import Link from "next/link";
import { Activity, Home, Upload, History, Utensils, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@/components/auth/sign-out-button";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vitals From Photo",
  description: "Extract health vitals from kiosk photos using AI",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-background">
            {/* Navigation Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-14 items-center">
                <div className="mr-4 flex">
                  <Link href="/" className="mr-6 flex items-center space-x-2">
                    <Activity className="h-6 w-6" />
                    <span className="hidden font-bold sm:inline-block">Vitals From Photo</span>
                  </Link>
                  <nav className="flex items-center space-x-6 text-sm font-medium">
                    <Link
                      href="/"
                      className="transition-colors hover:text-foreground/80 text-foreground/60"
                    >
                      <span className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        Dashboard
                      </span>
                    </Link>
                    <Link
                      href="/upload"
                      className="transition-colors hover:text-foreground/80 text-foreground/60"
                    >
                      <span className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Upload
                      </span>
                    </Link>
                    <Link
                      href="/history"
                      className="transition-colors hover:text-foreground/80 text-foreground/60"
                    >
                      <span className="flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Vitals
                      </span>
                    </Link>
                    <Link
                      href="/meals"
                      className="transition-colors hover:text-foreground/80 text-foreground/60"
                    >
                      <span className="flex items-center gap-2">
                        <Utensils className="h-4 w-4" />
                        Meals
                      </span>
                    </Link>
                  </nav>
                </div>
                <div className="flex items-center ml-auto">
                  <SignOutButton />
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto py-6 px-4">{children}</main>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
