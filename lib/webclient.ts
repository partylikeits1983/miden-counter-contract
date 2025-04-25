"use client";

import {
  WebClient,
  AccountStorageMode,
  AccountId,
  NoteType,
} from "@demox-labs/miden-sdk";
import { useWallet } from "@demox-labs/miden-wallet-adapter-react";
import type { TridentWalletAdapter } from "@demox-labs/miden-wallet-adapter-trident";

const nodeEndpoint = "https://rpc.testnet.miden.io:443";

export async function getCount(): Promise<number> {
  const client = await WebClient.createClient(nodeEndpoint);
  const state = await client.syncState();

  let accountId = AccountId.fromHex("0x5fd8e3b9f4227200000581c6032f81");

  await client.importAccountById(accountId);

  let account = await client.getAccount(accountId);

  // error here:
  console.log("account", account);

  return state.blockNum();
}

export async function incrementCount(): Promise<void> {
  try {
    // 1. Create client
    const client = await WebClient.createClient(nodeEndpoint);

    // 2. Sync and log block
    const state = await client.syncState();
    console.log("Latest block number:", state.blockNum());

    console.log("Creating faucet...");
    const faucetAccount = await client.newFaucet(
      AccountStorageMode.public(),
      false,
      "MID",
      8,
      BigInt(1_000_000),
    );
    const faucetIdHex = faucetAccount.id().toString();
    console.log("Faucet account ID:", faucetIdHex);

    await client.fetchAndCacheAccountAuthByAccountId(
      AccountId.fromHex(faucetIdHex),
    );
    await client.syncState();

    /*    console.log("getting account id");
    console.log("account id:", accountId);


    console.log("Minting tokens to Alice...");
    let mintTxRequest = client.newMintTransactionRequest(
      AccountId.fromHex(accountId),
      AccountId.fromHex(faucetIdHex),
      NoteType.Public,
      BigInt(1000),
    );

    let txResult = await client.newTransaction(
      faucetAccount.id(),
      mintTxRequest,
    );

    await client.submitTransaction(txResult);
 */
    await client.newTransaction;
    console.log("Tokens sent.");
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
