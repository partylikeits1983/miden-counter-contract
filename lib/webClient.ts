"use client";

// Counter contract account id on testnet - defined once
const COUNTER_CONTRACT_ID_HEX = "0xb32d619dfe9e2f0000010ecb441d3f";
const NODE_ENDPOINT = "https://rpc.testnet.miden.io:443";

export async function getCount(): Promise<number> {
  if (typeof window === "undefined") {
    console.warn("getCount() can only run in the browser");
    return 0;
  }

  // dynamic import → only in the browser, so WASM is loaded client‑side
  const { WebClient, AccountId } = await import("@demox-labs/miden-sdk");

  const counterContractId = AccountId.fromHex(COUNTER_CONTRACT_ID_HEX);

  const client = await WebClient.createClient(NODE_ENDPOINT);

  // Get the account, import if not found
  let counterContractAccount = await client.getAccount(counterContractId);
  
  if (!counterContractAccount) {
    await client.importAccountById(counterContractId);
    await client.syncState();
    counterContractAccount = await client.getAccount(counterContractId);
    if (!counterContractAccount) {
      throw new Error(`Account not found after import: ${counterContractId}`);
    }
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
  const {
    AccountId,
    AssemblerUtils,
    TransactionKernel,
    TransactionRequestBuilder,
    TransactionScript,
    TransactionScriptInputPairArray,
    WebClient,
  } = await import("@demox-labs/miden-sdk");

  const counterContractId = AccountId.fromHex(COUNTER_CONTRACT_ID_HEX);

  try {
    const client = await WebClient.createClient(NODE_ENDPOINT);
    console.log("Current block number: ", (await client.syncState()).blockNum());

    // Counter contract code in Miden Assembly
    const counterContractCode = `
      use.miden::account
      use.std::sys

      # => []
      export.get_count
          push.0
          # => [index]
          
          # exec.account::get_item
          # => [count]
          
          # exec.sys::truncate_stack
          # => []
      end

      # => []
      export.increment_count
          push.0
          # => [index]
          
          exec.account::get_item
          # => [count]
          
          push.1 add
          # => [count+1]

          # debug statement with client
          debug.stack

          push.0
          # [index, count+1]
          
          exec.account::set_item
          # => []
          
          push.1 exec.account::incr_nonce
          # => []
          
          exec.sys::truncate_stack
          # => []
      end
    `;

    // Building the counter contract
    let assembler = TransactionKernel.assembler();

    // Reading the public state of the counter contract from testnet,
    // and importing it into the WebClient
    let counterContractAccount = await client.getAccount(counterContractId);
    if (!counterContractAccount) {
      await client.importAccountById(counterContractId);
      await client.syncState();
      counterContractAccount = await client.getAccount(counterContractId);
      if (!counterContractAccount) {
        throw new Error(`Account not found after import: ${counterContractId}`);
      }
    }

    // Building the transaction script which will call the counter contract
    let txScriptCode = `
      use.external_contract::counter_contract
      begin
          call.counter_contract::increment_count
      end
    `;

    // Empty inputs to the transaction script
    const inputs = new TransactionScriptInputPairArray();

    // Creating the library to call the counter contract
    let counterComponentLib = AssemblerUtils.createAccountComponentLibrary(
      assembler, // assembler
      "external_contract::counter_contract", // library path to call the contract
      counterContractCode, // account code of the contract
    );

    // Creating the transaction script
    let txScript = TransactionScript.compile(
      txScriptCode,
      inputs,
      assembler.withLibrary(counterComponentLib),
    );

    // Creating a transaction request with the transaction script
    let transactionRequest = new TransactionRequestBuilder()
      .withCustomScript(txScript)
      .build();

    // Executing the transaction script against the counter contract
    let transactionResult = await client.newTransaction(
      counterContractAccount.id(),
      transactionRequest,
    );

    // Submit transaction
    await client.submitTransaction(transactionResult);

    // Sync state
    await client.syncState();

    // Logging the count of counter contract
    let counter = await client.getAccount(counterContractAccount.id());

    // Here we get the first Word from storage of the counter contract
    // A word is comprised of 4 Felts, 2**64 - 2**32 + 1
    let count = counter?.storage().getItem(0);

    // Converting the Word represented as a hex to a single integer value
    const counterValue = Number(
      BigInt("0x" + count!.toHex().slice(-16).match(/../g)!.reverse().join("")),
    );

    console.log("Count: ", counterValue);

    const txId = transactionResult.executedTransaction().id().toHex();
    const txUrl = `https://testnet.midenscan.com/tx/${txId}`;

    console.log(txUrl);

    return txUrl;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}