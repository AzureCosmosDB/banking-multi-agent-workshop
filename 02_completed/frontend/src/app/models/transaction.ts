export interface Transaction {
  id: string;
  accountId: string;
  debitAmount: number;
  creditAmount: number;
  accountBalance: number;
  details: string;
  transactionDateTime: string;
}

export interface TransactionDisplay {
  id: string;
  description: string;
  amount: string;
  type: 'credit' | 'debit';
  date: string;
  balance: string;
  transactionDateTime: string;
}