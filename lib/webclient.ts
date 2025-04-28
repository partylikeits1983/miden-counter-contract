"use client";

import {
  WebClient,
  AccountStorageMode,
  AccountId,
  NoteType,
  Word,
  TransactionRequestBuilder,
} from "@demox-labs/miden-sdk";
import { useWallet } from "@demox-labs/miden-wallet-adapter-react";
import type { TridentWalletAdapter } from "@demox-labs/miden-wallet-adapter-trident";

const nodeEndpoint = "https://rpc.testnet.miden.io:443";

const counterContractId = AccountId.fromHex("0x5fd8e3b9f4227200000581c6032f81");

export async function getCount(): Promise<number> {
  const client = await WebClient.createClient(nodeEndpoint);
  await client.syncState();

  let account = await client.getAccount(counterContractId);

  if (!account) {
    await client.importAccountById(counterContractId);
    await client.syncState();
    account = await client.getAccount(counterContractId);
    if (!account) {
      throw new Error(`Account not found after import: ${counterContractId}`);
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

    // @dev TODO: Need to enable compiling a transaction script with an assembler that has an added library.
    /*     
      let txScript = `
      use.external_contract::counter_contract
      begin
          call.counter_contract::increment_count
      end
    `; 
    */
   // Otherwise you need to call the mast root of the procedure you want to call:

    let txScript = `
    begin
      call.0xecd7eb223a5524af0cc78580d96357b298bb0b3d33fe95aeb175d6dab9de2e54
    end
    `;

    let transactionScript = await client.compileTxScript(txScript);

    let transactionRequest = new TransactionRequestBuilder()
      .withCustomScript(transactionScript)
      .build();

    let transactionResult = await client.newTransaction(
      counterContractId,
      transactionRequest,
    );

    await client.submitTransaction(transactionResult);
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
