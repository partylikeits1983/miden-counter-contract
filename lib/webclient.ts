"use client";

import {
  WebClient,
  AccountStorageMode,
  AccountId,
  NoteType,
} from "@demox-labs/miden-sdk";

const nodeEndpoint = "https://rpc.testnet.miden.io:443";

export async function getCount(): Promise<Number> {
  try {
    // 1. Create client
    const client = await WebClient.createClient(nodeEndpoint);

    // 2. Sync and log block
    const state = await client.syncState();
    console.log("Latest block number:", state.blockNum());
    await client.syncState();

    return state.blockNum();
  } catch (error) {
    console.error("Error:", error);
    return 0;
  }
}

export async function incrementCount(): Promise<void> {
  try {
    // 1. Create client
    const client = await WebClient.createClient(nodeEndpoint);

    // 2. Sync and log block
    const state = await client.syncState();
    console.log("Latest block number:", state.blockNum());

    // 3. Create Alice account (public, updatable)
    console.log("Creating account for Alice");
    const aliceAccount = await client.newWallet(
      AccountStorageMode.public(),
      true,
    );
    const aliceIdHex = aliceAccount.id().toString();
    console.log("Alice's account ID:", aliceIdHex);

    await client.syncState();
    console.log("Tokens sent.");
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
