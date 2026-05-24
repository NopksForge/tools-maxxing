import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Toolsmaxxing — Community AI Tools Catalog",
  description:
    "Discover, submit, and curate the best AI tools. Community-driven catalog with strict pricing badges and real reviews.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      style={
        {
          "--f-sans": "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
          "--f-mono":
            "var(--font-jetbrains-mono), ui-monospace, 'SF Mono', monospace",
        } as React.CSSProperties
      }
    >
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              fontFamily: "var(--f-sans)",
              fontSize: "14px",
              borderRadius: "var(--r-md)",
              border: "1px solid var(--line)",
              background: "var(--card)",
              color: "var(--text)",
            },
          }}
        />
      </body>
    </html>
  );
}
