/**
 * TEMPORARY SAMPLE DATA — FOR LAYOUT & UI PREVIEW ONLY
 * 
 * Note for College Review:
 * These records are static mock transactions used solely to develop and preview
 * the frontend layout in Module 1. In subsequent modules, this data will be
 * completely replaced by dynamic data fetched from the Express + MongoDB REST API.
 */

export const SAMPLE_TRANSACTIONS = [
  {
    id: 'tx_1',
    description: 'Monthly Salary',
    amount: 55000,
    type: 'income',
    category: 'Salary',
    date: '2026-10-01',
    paymentMethod: 'Bank Transfer',
    note: 'Primary job monthly compensation'
  },
  {
    id: 'tx_2',
    description: 'Apartment Rent',
    amount: 15000,
    type: 'expense',
    category: 'Housing',
    date: '2026-10-02',
    paymentMethod: 'Net Banking',
    note: 'October apartment rent'
  },
  {
    id: 'tx_3',
    description: 'Grocery Shopping',
    amount: 3450,
    type: 'expense',
    category: 'Groceries',
    date: '2026-10-05',
    paymentMethod: 'UPI',
    note: 'Weekly essentials and produce'
  },
  {
    id: 'tx_4',
    description: 'Freelance Design Project',
    amount: 12000,
    type: 'income',
    category: 'Freelance',
    date: '2026-10-08',
    paymentMethod: 'UPI',
    note: 'Landing page design milestone'
  },
  {
    id: 'tx_5',
    description: 'Electricity & Water Bill',
    amount: 2180,
    type: 'expense',
    category: 'Utilities',
    date: '2026-10-10',
    paymentMethod: 'Debit Card',
    note: 'Monthly utility payments'
  },
  {
    id: 'tx_6',
    description: 'Internet Broadband Bill',
    amount: 999,
    type: 'expense',
    category: 'Utilities',
    date: '2026-10-12',
    paymentMethod: 'UPI',
    note: 'High-speed fiber connection'
  },
  {
    id: 'tx_7',
    description: 'Textbooks & Study Supplies',
    amount: 1250,
    type: 'expense',
    category: 'Education',
    date: '2026-10-14',
    paymentMethod: 'Cash',
    note: 'Semester exam reference guides'
  }
];

export const MOCK_SUMMARY = {
  totalIncome: 67000,
  totalExpenses: 22879,
  netBalance: 44121
};
