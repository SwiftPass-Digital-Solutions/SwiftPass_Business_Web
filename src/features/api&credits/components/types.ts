export const COLUMNS = [
  { key: "date", label: "Date" },
  { key: "action", label: "Action" },
  { key: "credits", label: "Credits" },
  { key: "balance", label: "Balance" },
];

export interface BillingHistoryItem {
  date: string;
  action: string;
  credits: string;
  balance: string;
}

export interface RecentCreditHistoryItem {
  id: number;
  credits: number;
  amount: number;
  balanceAfter: number;
  transactionType: string;
  description: string;
  createdAt: string;
}
