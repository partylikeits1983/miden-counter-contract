"use client";

export async function getCount(): Promise<number> {
  if (typeof window === "undefined") {
    console.warn("getCount() can only run in the browser");
    return 0;
  }

  // dynamic import → only in the browser, so WASM is loaded client‑side
  const { WebClient, AccountId } = await import("@demox-labs/miden-sdk");

  const nodeEndpoint = "https://rpc.testnet.miden.io:443";

  // Counter contract account id on testnet
  const counterContractId = AccountId.fromHex(
    "0xb32d619dfe9e2f0000010ecb441d3f",
  );

  const client = await WebClient.createClient(nodeEndpoint);

  // Note: Actual methods may differ, this is a placeholder
  const counterContractAccount = await client.getAccount(counterContractId);

  if (!counterContractAccount) {
    throw new Error(`Account not found: ${counterContractId}`);
  }

  // read slot 0
  const storageItem = counterContractAccount.storage().getItem(0);
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

export async function incrementCount(): Promise<string> {
  if (typeof window === "undefined") {
    console.warn("incrementCount() can only run in the browser");
    return "";
  }

  // dynamic import → only in the browser, so WASM is loaded client‑side
  const { WebClient, AccountId, TransactionRequestBuilder } = await import(
    "@demox-labs/miden-sdk"
  );

  const nodeEndpoint = "https://rpc.testnet.miden.io:443";

  // Counter contract account id on testnet
  const counterContractId = AccountId.fromHex(
    "0xb32d619dfe9e2f0000010ecb441d3f",
  );

  try {
    const client = await WebClient.createClient(nodeEndpoint);

    // Transaction script to call the increment method
    const txScript = `
    begin
      call.0xecd7eb223a5524af0cc78580d96357b298bb0b3d33fe95aeb175d6dab9de2e54
    end
    `;

    // Prepare transaction request
    const transactionRequest = new TransactionRequestBuilder()
      .withCustomScript(client.compileTxScript(txScript))
      .build();

    // Execute transaction
    const transactionResult = await client.newTransaction(
      counterContractId,
      transactionRequest,
    );

    // Submit transaction
    await client.submitTransaction(transactionResult);

    const txId = transactionResult.executedTransaction().id().toHex();
    const txUrl = `https://testnet.midenscan.com/tx/${txId}`;

    console.log(txUrl);

    return txUrl;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
