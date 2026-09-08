import type { Metadata } from "next";
import { WalletProvider } from "@/components/WalletContext";
import { SharedDataProvider } from "@/components/SharedDataContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "MFNGuard",
  description: "Privacy-preserving Most-Favored-Nation pricing compliance verifier",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-white min-h-screen">
        <SharedDataProvider>
          <WalletProvider>
            {children}
          </WalletProvider>
        </SharedDataProvider>
      </body>
    </html>
  );
}
