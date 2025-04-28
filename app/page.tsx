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
// import { useWallet } from "@demox-labs/miden-wallet-adapter-react";

export default function Home() {
  // const { publicKey, wallet } = useWallet();
  // how to initialize public key and wallet?

  const wallets = useMemo(
    () => [
      new TridentWalletAdapter({
        appName: "My Miden App",
      }),
    ],
    [],
  );

  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchInitial() {
      try {
        const { getCount } = await import("../lib/webClient");
        const initial = await getCount();
        setCount(initial.valueOf());
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchInitial();
  }, []);

  const handleIncrement = async () => {
    setIsLoading(true);
    try {
      const { incrementCount, getCount } = await import("../lib/webClient");
      await incrementCount();
      const updated = await getCount();
      setCount(updated.valueOf());
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <WalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider>
        <div className="grid grid-rows-[auto_1fr_20px] items-center justify-items-center min-h-screen px-8 sm:px-20 pb-20 gap-16 font-[family-name:var(--font-geist-sans)]">
          <header className="row-start-1 w-full flex justify-end mt-6 space-x-4">
            <WalletMultiButton />
          </header>

          <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
            <h1 className="text-8xl font-bold">
              Counter Count: {isLoading ? "loading..." : count}
            </h1>
            <button
              onClick={handleIncrement}
              disabled={isLoading}
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              Increment
            </button>
          </main>

          <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
            <a
              className="flex items-center gap-2 hover:underline hover:underline-offset-4"
              href="https://0xpolygonmiden.github.io/miden-docs/"
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
              href="https://0xpolygonmiden.github.io/miden-docs/imported/miden-tutorials/src/index.html"
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
              className="flex items-center gap-[24px] hover:underline hover:underline-offset-4"
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
