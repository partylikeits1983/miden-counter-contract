"use client";

// Counter contract account id on testnet - defined once
const COUNTER_CONTRACT_ID_HEX = "0xf3f858cecbcd79200003beceba4f7a";
const NODE_ENDPOINT = "https://rpc.testnet.miden.io:443";

const TokenSymbol = {
  MAX_ENCODED_VALUE: 0xffffffffffff, // Example max value
  ALPHABET_LENGTH: 26, // A-Z (26 letters)
  MAX_SYMBOL_LENGTH: 5, // Example maximum length for token symbols
};

function decodeFeltToSymbol(encodedFelt: number): string | string {
  // Check if the encoded value is within the valid range
  if (encodedFelt > TokenSymbol.MAX_ENCODED_VALUE) {
    return `Error: Value ${encodedFelt} is too large`;
  }

  let decodedString = "";
  let remainingValue = encodedFelt;

  // Get the token symbol length
  const tokenLen = remainingValue % TokenSymbol.ALPHABET_LENGTH;
  if (tokenLen === 0 || tokenLen > TokenSymbol.MAX_SYMBOL_LENGTH) {
    return `Error: Invalid token length: ${tokenLen}`;
  }
  remainingValue = Math.floor(remainingValue / TokenSymbol.ALPHABET_LENGTH);

  for (let i = 0; i < tokenLen; i++) {
    const digit = remainingValue % TokenSymbol.ALPHABET_LENGTH;
    const char = String.fromCharCode(digit + 65); // 'A' is 65 in ASCII
    decodedString = char + decodedString; // Insert at the start to reverse the order
    remainingValue = Math.floor(remainingValue / TokenSymbol.ALPHABET_LENGTH);
  }

  // Return an error if some data still remains after specified number of characters
  if (remainingValue !== 0) {
    return "Error: Data not fully decoded";
  }

  return decodedString;
}

export interface TokenInfo {
  symbol: string;
  decimals: number;
  maxSupply: number;
}

export async function getTokenInfo(): Promise<TokenInfo> {
  if (typeof window === "undefined") {
    console.warn("getTokenInfo() can only run in the browser");
    return { symbol: "N/A", decimals: 0, maxSupply: 0 };
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
  const storageItem = counterContractAccount.storage().getItem(2);
  if (!storageItem) {
    throw new Error("No storage item at key 0");
  }
  const valueWord = storageItem.toHex();

  console.log("Original hex:", valueWord);

  const hex = valueWord.slice(2); // Remove '0x' prefix
  const reversed = hex.match(/.{2}/g)!.reverse(); // Split into pairs and reverse them

  // Create an array of 4 elements, each 32 bits (4 bytes) in size
  const array = [];
  for (let i = 0; i < 4; i++) {
    const startIndex = i * 8; // Each element is 8 hex digits (4 bytes)
    const slice = reversed.slice(startIndex, startIndex + 8).join(""); // Join pairs for each element
    array.push(parseInt(slice, 16)); // Convert the slice from hex to a number
  }

  console.log("Array of 4 elements each 16 bits:", array);

  let val = array[1];

  console.log("val", val);

  let symbol = decodeFeltToSymbol(val);
  console.log("symbol", symbol);

  let maxSupply = array[3];
  let decimals = array[2];

  console.log(
    "Symbol:",
    symbol,
    "Decimals:",
    decimals,
    "Max Supply:",
    maxSupply,
  );

  return {
    symbol: typeof symbol === "string" ? symbol : "ERROR",
    decimals,
    maxSupply,
  };
}

// Keep the old function for backward compatibility, but make it use the new one
export async function getCount(): Promise<number> {
  return 0;
}
