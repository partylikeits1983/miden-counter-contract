"use client";

import {
  WebClient,
  AccountStorageMode,
  AccountId,
  NoteType,
  Word,
} from "@demox-labs/miden-sdk";
import { useWallet } from "@demox-labs/miden-wallet-adapter-react";
import type { TridentWalletAdapter } from "@demox-labs/miden-wallet-adapter-trident";

const nodeEndpoint = "https://rpc.testnet.miden.io:443";

export async function getCount(): Promise<number> {
  const client = await WebClient.createClient(nodeEndpoint);
  await client.syncState();

  const accountId = AccountId.fromHex("0x5fd8e3b9f4227200000581c6032f81");

  let account = await client.getAccount(accountId);

  if (!account) {
    await client.importAccountById(accountId);
    await client.syncState();
    account = await client.getAccount(accountId);
    if (!account) {
      throw new Error(`Account not found after import: ${accountId}`);
    }
  }

  // read slot 0
  const storageItem = account.storage().getItem(0);
  if (!storageItem) {
    throw new Error("No storage item at key 0");
  }
  const valueWord = storageItem.toHex();

  const hex = valueWord.toString().slice(2);
  const last8 = hex.slice(-16);
  const reversed = last8.match(/.{2}/g)!.reverse().join("");
  const count = Number(BigInt(`0x${reversed}`));

  console.log("storage count =", count);
  return count;
}

export async function incrementCount(): Promise<void> {
  try {
    const client = await WebClient.createClient(nodeEndpoint);

    const state = await client.syncState();
    console.log("Latest block number:", state.blockNum());

    let txScript = `
      use.external_contract::counter_contract
      begin
          call.counter_contract::increment_count
      end
    `;

    let _transactionScript = await client.compileTxScript(txScript);
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
