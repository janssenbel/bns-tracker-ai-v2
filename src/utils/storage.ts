import { VehicleRecord } from '../types';

const STORAGE_KEY = 'car_inventory_offline_log';
const THEME_KEY = 'belbros_theme';
const AUTO_BACKUP_KEY = 'belbros_auto_backup';

// Legacy sample IDs to strip out if previously seeded in localStorage
const LEGACY_SAMPLE_IDS = new Set([1711200001, 1711200002, 1711200003]);

export function getStoredRecords(): VehicleRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const cleaned = parsed.filter((r) => !LEGACY_SAMPLE_IDS.has(r.id));
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
      }
      return cleaned;
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
  if (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark';
  }
  return 'light';
}

export function saveTheme(theme: 'dark' | 'light'): void {
  localStorage.setItem(THEME_KEY, theme);
}

const BUSINESS_NAME_KEY = 'belbros_business_name';
export const DEFAULT_BUSINESS_NAME = 'BelBros Car Trading';

export function getStoredAutoBackup(): boolean {
  const val = localStorage.getItem(AUTO_BACKUP_KEY);
  return val === 'true';
}

export function saveAutoBackup(enabled: boolean): void {
  localStorage.setItem(AUTO_BACKUP_KEY, enabled ? 'true' : 'false');
}

export function getStoredBusinessName(): string {
  try {
    const saved = localStorage.getItem(BUSINESS_NAME_KEY);
    return saved && saved.trim() ? saved.trim() : DEFAULT_BUSINESS_NAME;
  } catch {
    return DEFAULT_BUSINESS_NAME;
  }
}

export function saveBusinessName(name: string): void {
  try {
    const trimmed = name.trim() || DEFAULT_BUSINESS_NAME;
    localStorage.setItem(BUSINESS_NAME_KEY, trimmed);
  } catch (err) {
    console.error('Failed to save business name', err);
  }
}

