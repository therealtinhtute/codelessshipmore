import type { Metadata } from "next";
import { Bricolage_Grotesque, Lora, Google_Sans_Code } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { AISettingsProvider } from "@/contexts/ai-settings-context";
import { AppSidebar } from "@/components/layout/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "CodelessShipMore - Developer Tools",
  description:
    "A collection of developer utilities for JSON, SQL, Protobuf, and Properties conversion",
};

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-sans",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
});

const googleSansCode = Google_Sans_Code({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        bricolage.variable,
        lora.variable,
        googleSansCode.variable,
        "font-sans",
      )}
      suppressHydrationWarning
    >
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <AISettingsProvider>
              <AppSidebar>{children}</AppSidebar>
            </AISettingsProvider>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
