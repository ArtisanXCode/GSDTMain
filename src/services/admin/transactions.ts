import { ethers } from "ethers";
import { Transaction, TransactionStatus, TransactionType } from "./types";
import { GSDC_ADDRESS } from "../../contracts/GSDC";

// Use the same contract address as defined in useContract.ts
const BSC_SCAN_API_KEY = import.meta.env.VITE_BSC_SCAN_API_KEY;
const BSC_SCAN_API_LINK =
  import.meta.env.VITE_BSC_SCAN_API_LINK || "https://api-testnet.bscscan.com/";

interface BscScanTransaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  isError: string;
  txreceipt_status: string;
  functionName: string;
  input: string;
  gasUsed: string;
  gasPrice: string;
}

const extractMintBurnAmount = (transaction: BscScanTransaction): string => {
  const { functionName, input } = transaction;

  if (
    !functionName.toLowerCase().includes("mint") &&
    !functionName.toLowerCase().includes("burn")
  ) {
    return "0";
  }

  try {
    // Extract amount from input data - typically the second parameter after address
    const amountHex = input.slice(74, 138); // Skip function selector (4 bytes) + address (32 bytes)
    return BigInt("0x" + amountHex).toString();
  } catch {
    return "0";
  }
};

const mapBscScanTransaction = (tx: BscScanTransaction): Transaction => {
  let type = TransactionType.TRANSFER;

  // Determine transaction type based on function name
  if (tx.functionName.toLowerCase().includes("mint")) {
    type = TransactionType.MINT;
  } else if (tx.functionName.toLowerCase().includes("burn")) {
    type = TransactionType.BURN;
  } else if (tx.functionName.toLowerCase().includes("updatekycstatus")) {
    type = TransactionType.UPDATE_KYC;
  } else if (tx.functionName.toLowerCase().includes("requestredemption")) {
    type = TransactionType.REQUEST_REDEEM;
  } else if (tx.functionName.toLowerCase().includes("processredemption")) {
    type = TransactionType.PROCESS_REDEEM;
  } else if (tx.functionName.toLowerCase().includes("grantrole")) {
    type = TransactionType.GRANT_ROLE;
  } else if (tx.functionName.toLowerCase().includes("revokerole")) {
    type = TransactionType.REVOKE_ROLE;
  } else if (tx.to.toLowerCase() === GSDC_ADDRESS.toLowerCase()) {
    type = TransactionType.MINT;
  } else if (tx.from.toLowerCase() === GSDC_ADDRESS.toLowerCase()) {
    type = TransactionType.REDEEM;
  }

  let status = TransactionStatus.COMPLETED;
  if (tx.isError === "1" || tx.txreceipt_status === "0") {
    status = TransactionStatus.FAILED;
  }

  const value = extractMintBurnAmount(tx);

  return {
    id: tx.hash,
    type,
    status,
    amount: value,
    fromAddress: tx.from,
    toAddress: tx.to,
    timestamp: new Date(parseInt(tx.timeStamp) * 1000),
    blockNumber: parseInt(tx.blockNumber),
    txHash: tx.hash,
  };
};

export const fetchTransactions = async (
  status?: TransactionStatus,
  type?: TransactionType,
  currentPage = 1,
  pageSize = 10,
): Promise<{
  transactions: Transaction[];
  totalItems: number;
}> => {
  try {
    if (!BSC_SCAN_API_KEY) {
      throw new Error(
        "BSCScan API key is missing. Please add VITE_BSC_SCAN_API_KEY to your environment variables.",
      );
    }

    const url = `${BSC_SCAN_API_LINK}api?module=account&action=txlist&address=${GSDC_ADDRESS}&startblock=0&endblock=99999999&sort=desc&apikey=${BSC_SCAN_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "1" && Array.isArray(data.result)) {
      let txs = data.result
        .filter(
          (tx: BscScanTransaction) =>
            // Only include transactions that interact with our contract
            tx.to.toLowerCase() === GSDC_ADDRESS.toLowerCase() ||
            tx.from.toLowerCase() === GSDC_ADDRESS.toLowerCase(),
        )
        .map(mapBscScanTransaction);

      // Apply filters
      if (status) {
        txs = txs.filter((tx) => tx.status === status);
      }
      if (type) {
        txs = txs.filter((tx) => tx.type === type);
      }

      // Apply pagination
      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize;

      return {
        transactions: txs.slice(start, end),
        totalItems: txs.length,
      };
    }

    // Return empty result if no transactions found
    return {
      transactions: [],
      totalItems: 0,
    };
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
};
