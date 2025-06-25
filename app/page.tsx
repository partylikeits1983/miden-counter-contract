"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";

import { WalletProvider } from "@demox-labs/miden-wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@demox-labs/miden-wallet-adapter-reactui";
import { TridentWalletAdapter } from "@demox-labs/miden-wallet-adapter-trident";
import "@demox-labs/miden-wallet-adapter-reactui/styles.css";

interface TokenInfo {
  symbol: string;
  decimals: number;
  maxSupply: number;
}

export default function Home() {
  const wallets = useMemo(
    () => [
      new TridentWalletAdapter({
        appName: "My Miden App",
      }),
    ],
    [],
  );

  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchTokenInfo() {
      try {
        const { getTokenInfo } = await import("../lib/webClient");
        const info = await getTokenInfo();
        setTokenInfo(info);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTokenInfo();
  }, []);

  return (
    <WalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider>
        {/* ------------------- Layout Shell ------------------- */}
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 text-slate-800 dark:text-slate-100 flex flex-col">
          {/* ------------------- Header ------------------- */}
          <header className="w-full px-4 sm:px-8 py-4 flex justify-end">
            <WalletMultiButton className="!text-sm xs:!text-base" />
          </header>

          {/* ------------------- Main ------------------- */}
          <main className="flex-1 flex items-center justify-center px-4 sm:px-0">
            {/* Card */}
            <section className="w-full max-w-md bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-6">
              {/* 1) Faucet Link */}
              <a
                href="https://faucet.testnet.miden.io"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium hover:underline underline-offset-4"
              >
                Miden Testnet Faucet
              </a>

              {/* 2) Token Information */}
              {isLoading ? (
                <div className="text-center">
                  <h1 className="text-4xl font-extrabold tracking-tight mb-4">Loading Token Info...</h1>
                </div>
              ) : tokenInfo ? (
                <div className="text-center space-y-4 w-full">
                  <h1 className="text-5xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400">
                    {tokenInfo.symbol}
                  </h1>
                  
                  <div className="grid grid-cols-1 gap-4 w-full">
                    <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4">
                      <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Symbol
                      </div>
                      <div className="text-2xl font-bold">
                        {tokenInfo.symbol}
                      </div>
                    </div>
                    
                    <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4">
                      <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Decimals
                      </div>
                      <div className="text-2xl font-bold">
                        {tokenInfo.decimals}
                      </div>
                    </div>
                    
                    <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4">
                      <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Max Supply
                      </div>
                      <div className="text-2xl font-bold">
                        {tokenInfo.maxSupply.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <h1 className="text-4xl font-extrabold tracking-tight text-red-500">
                    Failed to load token info
                  </h1>
                </div>
              )}
            </section>
          </main>

          {/* ------------------- Footer ------------------- */}
          <footer className="w-full px-4 sm:px-8 py-6 flex flex-wrap items-center justify-center gap-6 text-sm opacity-80">
            <a
              className="flex items-center gap-2 hover:underline hover:underline-offset-4"
              href="https://0xMiden.github.io/miden-docs/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                aria-hidden
                src="/file.svg"
                alt="File icon"
                width={16}
                height={16}
              />
              Miden Docs
            </a>
            <a
              className="flex items-center gap-2 hover:underline hover:underline-offset-4"
              href="https://0xMiden.github.io/miden-docs/imported/miden-tutorials/src/index.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                aria-hidden
                src="/window.svg"
                alt="Window icon"
                width={16}
                height={16}
              />
              Tutorials
            </a>
            <a
              className="flex items-center gap-2 hover:underline hover:underline-offset-4"
              href="https://github.com/0xMiden"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                aria-hidden
                src="/github.svg"
                alt="GitHub icon"
                width={16}
                height={16}
              />
              GitHub
            </a>
          </footer>
        </div>
      </WalletModalProvider>
    </WalletProvider>
  );
}
