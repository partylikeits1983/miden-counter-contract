"use client";

import { useState, useEffect } from "react";
import { WalletMultiButton } from "@demox-labs/miden-wallet-adapter-reactui";
import Image from "next/image";
import "@demox-labs/miden-wallet-adapter-reactui/styles.css";

export default function Home() {
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [transactionUrl, setTransactionUrl] = useState<string>("");

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
      const txUrlObject = await incrementCount();
      const txUrl = txUrlObject.toString(); // ensure primitive string not String object
      setTransactionUrl(txUrl);

      const updated = await getCount();
      setCount(updated.valueOf());
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
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
            {/* 1) Counter contract on Midenscan */}
            <a
              href="https://testnet.midenscan.com/account/mtst1qzej6cval60z7qqqqy8vk3qa8u4kzcq9"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium hover:underline underline-offset-4"
            >
              Counter Contract on Midenscan
            </a>

            {/* 2) Count */}
            <h1 className="text-6xl font-extrabold tracking-tight text-center tabular-nums min-h-[3.5rem]">
              {isLoading ? "…" : count}
            </h1>

            {/* 3) Increment Button */}
            <button
              onClick={handleIncrement}
              disabled={isLoading}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-400/50 hover:brightness-110 transition disabled:opacity-50 w-full sm:w-auto"
            >
              {isLoading ? "Processing…" : "Increment"}
            </button>

            {/* 4) Link to Tx */}
            {transactionUrl && (
              <a
                href={transactionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline underline-offset-4 break-all text-center"
              >
                View Transaction on Midenscan
              </a>
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
    </div>
  );
}
