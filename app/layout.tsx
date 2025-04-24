"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ReactNode, useMemo } from "react";
import { WalletProvider } from "@demox-labs/miden-wallet-adapter-react";
import { WalletModalProvider } from "@demox-labs/miden-wallet-adapter-reactui";
import { TridentWalletAdapter } from "@demox-labs/miden-wallet-adapter-trident";
import { useWallet } from "@demox-labs/miden-wallet-adapter-react";
import "@demox-labs/miden-wallet-adapter-reactui/styles.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const wallets = useMemo(
    () => [
      new TridentWalletAdapter({
        appName: "My Miden App",
      }),
    ],
    [],
  );

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <PublicKeyDisplay />
            {children}
          </WalletModalProvider>
        </WalletProvider>
      </body>
    </html>
  );
}

function PublicKeyDisplay() {
  const { publicKey } = useWallet();
  return publicKey ? (
    <div
      style={{
        position: "fixed",
        bottom: 8,
        right: 8,
        background: "rgba(0,0,0,0.6)",
        color: "#fff",
        padding: "0.5rem 1rem",
        borderRadius: 4,
        fontSize: "0.875rem",
        fontFamily: "monospace",
        zIndex: 1000,
      }}
    >
      Connected: {publicKey}
    </div>
  ) : null;
}
