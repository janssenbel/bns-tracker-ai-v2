export type CurrencySymbol = '₱' | '$' | '€' | '¥' | 'AED';

export interface ExpenseItem {
  id?: string;
  name: string;
  value: string | number;
}

export interface PartnerSnapshotExpense {
  name: string;
  amount: number;
}

export interface PartnerSnapshot {
  id: string;
  name: string;
  share: number; // percentage (e.g. 50)
  spent: number;
  profitPortion: number;
  payout: number;
  expenses: PartnerSnapshotExpense[];
}

export interface PartnerWorkingState {
  id: string;
  name: string;
  share: number;
  expenses: ExpenseItem[];
}

export interface VehicleRecord {
  id: number;
  title: string;
  year: string | number;
  make: string;
  model: string;
  plate: string;
  dateBought: string;
  dateSold?: string;
  totalDays: number | null;
  dayStatus: 'Sold' | 'In Stock' | 'Invalid' | 'No Date';
  currency: CurrencySymbol | string;
  sell: number;
  totalCapital: number;
  profit: number;
  margin: number;
  partners: PartnerSnapshot[];
  createdAt: number;
  updatedAt?: number;
}

export type MainViewTab = 'calculator' | 'inventory' | 'summary';
