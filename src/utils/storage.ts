import { VehicleRecord } from '../types';

const STORAGE_KEY = 'car_inventory_offline_log';
const THEME_KEY = 'belbros_theme';
const AUTO_BACKUP_KEY = 'belbros_auto_backup';

export const SAMPLE_RECORDS: VehicleRecord[] = [
  {
    id: 1711200001,
    title: '2021 Toyota Fortuner 2.8 V 4x2 AT',
    year: '2021',
    make: 'Toyota',
    model: 'Fortuner 2.8 V 4x2 AT',
    plate: 'NCS 8291',
    dateBought: '2024-01-10',
    dateSold: '2024-02-04',
    totalDays: 25,
    dayStatus: 'Sold',
    currency: '₱',
    sell: 1680000,
    totalCapital: 1485000,
    profit: 195000,
    margin: 11.6,
    partners: [
      {
        id: 'p1',
        name: 'Janssen',
        share: 50,
        spent: 800000,
        profitPortion: 97500,
        payout: 897500,
        expenses: [
          { name: 'Vehicle Acquisition / Buy Share', amount: 750000 },
          { name: 'Detailing / 3-Stage Buffing & Interior Disinfection', amount: 15000 },
          { name: 'Mechanical PMS (Fully Synthetic Oil & Filters)', amount: 12000 },
          { name: 'Agent Finder Fee', amount: 23000 }
        ]
      },
      {
        id: 'p2',
        name: 'Ralph',
        share: 50,
        spent: 685000,
        profitPortion: 97500,
        payout: 782500,
        expenses: [
          { name: 'Vehicle Acquisition / Buy Share', amount: 650000 },
          { name: 'LTO Ownership Transfer & Doc Stamps', amount: 18000 },
          { name: 'Front Bumper Scuff Repaint & Touch-up', amount: 12000 },
          { name: 'Gasoline & Tollway (RFID)', amount: 5000 }
        ]
      }
    ],
    createdAt: 1706600000000,
    updatedAt: 1707000000000
  },
  {
    id: 1711200002,
    title: '2019 Honda Civic 1.5 RS Turbo',
    year: '2019',
    make: 'Honda',
    model: 'Civic 1.5 RS Turbo',
    plate: 'NDB 4410',
    dateBought: '2024-02-15',
    dateSold: '2024-03-02',
    totalDays: 16,
    dayStatus: 'Sold',
    currency: '₱',
    sell: 1050000,
    totalCapital: 920000,
    profit: 130000,
    margin: 12.4,
    partners: [
      {
        id: 'p1',
        name: 'Janssen',
        share: 50,
        spent: 470000,
        profitPortion: 65000,
        payout: 535000,
        expenses: [
          { name: 'Vehicle Acquisition / Buy Share', amount: 450000 },
          { name: 'Full Ceramic Coating & Glass Polish', amount: 14000 },
          { name: 'Spark Plugs & Brake Pads Replacement', amount: 6000 }
        ]
      },
      {
        id: 'p2',
        name: 'Ralph',
        share: 50,
        spent: 450000,
        profitPortion: 65000,
        payout: 515000,
        expenses: [
          { name: 'Vehicle Acquisition / Buy Share', amount: 430000 },
          { name: 'LTO Transfer & Notary Fees', amount: 15000 },
          { name: 'FB Marketplace Boost & Ads', amount: 5000 }
        ]
      }
    ],
    createdAt: 1707955200000,
    updatedAt: 1709424000000
  },
  {
    id: 1711200003,
    title: '2022 Mitsubishi Montero Sport GLS 2WD',
    year: '2022',
    make: 'Mitsubishi',
    model: 'Montero Sport GLS 2WD',
    plate: 'CBC 9923',
    dateBought: '2024-03-20',
    dateSold: '',
    totalDays: 18,
    dayStatus: 'In Stock',
    currency: '₱',
    sell: 1450000,
    totalCapital: 1315000,
    profit: 135000,
    margin: 9.3,
    partners: [
      {
        id: 'p1',
        name: 'Janssen',
        share: 50,
        spent: 660000,
        profitPortion: 67500,
        payout: 727500,
        expenses: [
          { name: 'Vehicle Acquisition / Buy Share', amount: 650000 },
          { name: 'Engine Detailing & Interior Wash', amount: 10000 }
        ]
      },
      {
        id: 'p2',
        name: 'Ralph',
        share: 50,
        spent: 655000,
        profitPortion: 67500,
        payout: 722500,
        expenses: [
          { name: 'Vehicle Acquisition / Buy Share', amount: 640000 },
          { name: 'LTO Verification & Smoke Emission', amount: 8000 },
          { name: 'Fuel & Transport', amount: 7000 }
        ]
      }
    ],
    createdAt: 1710892800000
  }
];

export function getStoredRecords(): VehicleRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed with sample records if first time
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_RECORDS));
      return SAMPLE_RECORDS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.error('Failed to parse stored records', err);
    return [];
  }
}

export function saveRecordsToStorage(records: VehicleRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error('Failed to save records', err);
  }
}

export function getStoredTheme(): 'dark' | 'light' {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark' || saved === 'light') return saved;
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export function saveTheme(theme: 'dark' | 'light'): void {
  localStorage.setItem(THEME_KEY, theme);
}

export function getStoredAutoBackup(): boolean {
  const val = localStorage.getItem(AUTO_BACKUP_KEY);
  return val === null ? true : val === 'true';
}

export function saveAutoBackup(enabled: boolean): void {
  localStorage.setItem(AUTO_BACKUP_KEY, enabled ? 'true' : 'false');
}
