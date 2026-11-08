import React, { useState, useEffect } from 'react';
import {
  CurrencySymbol,
  PartnerWorkingState,
  PartnerSnapshot,
  VehicleRecord,
} from '../types';
import { normalizePlate, formatCurrency, calculateDays } from '../utils/formatters';
import { SummaryCard } from './SummaryCard';
import {
  Plus,
  Trash2,
  Save,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface CalculatorViewProps {
  records: VehicleRecord[];
  activeUnitId: number | null;
  onSelectUnit: (id: number | null) => void;
  onSaveRecord: (record: VehicleRecord, autoBackup: boolean) => void;
  onOpenDealSheet: (record: VehicleRecord) => void;
  autoBackupEnabled: boolean;
  onToggleAutoBackup: (enabled: boolean) => void;
}

const COMMON_EXPENSE_TEMPLATES = [
  'Vehicle Acquisition / Buy Share',
  'Detailing / Cleaning / Buffing',
  'Mechanical PMS / Oil & Filters',
  'LTO Transfer / Notary / Doc Stamps',
  'Body Repair & Paint Touch-up',
  'Tires / Mags / Battery',
  'Agent / Finder Commission',
  'Gasoline & RFID Tolls',
];

const createDefaultPartners = (): PartnerWorkingState[] => [
  {
    id: 'p1',
    name: '',
    share: 50,
    expenses: [
      { id: 'e1', name: 'Vehicle Acquisition / Buy Share', value: '' },
      { id: 'e2', name: 'Detailing / Cleaning / Buffing', value: '' },
      { id: 'e3', name: 'Mechanical PMS / Engine Oil / Parts', value: '' },
    ],
  },
  {
    id: 'p2',
    name: '',
    share: 50,
    expenses: [
      { id: 'e4', name: 'Vehicle Acquisition / Buy Share', value: '' },
      { id: 'e5', name: 'LTO Transfer / Notary / Doc Stamps', value: '' },
      { id: 'e6', name: 'Body Repair & Paint Touch-up', value: '' },
    ],
  },
];

export const CalculatorView: React.FC<CalculatorViewProps> = ({
  records,
  activeUnitId,
  onSelectUnit,
  onSaveRecord,
  onOpenDealSheet,
  autoBackupEnabled,
  onToggleAutoBackup,
}) => {
  // Vehicle Metadata (Starts completely blank with no preloaded values)
  const [year, setYear] = useState<string>('');
  const [make, setMake] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [plate, setPlate] = useState<string>('');
  const [dateBought, setDateBought] = useState<string>('');
  const [dateSold, setDateSold] = useState<string>('');
  const [currency, setCurrency] = useState<CurrencySymbol>('₱');
  const [sellPrice, setSellPrice] = useState<string>('');

  // Partners State
  const [partners, setPartners] = useState<PartnerWorkingState[]>(createDefaultPartners);
  const [activePartnerId, setActivePartnerId] = useState<string>('p1');

  // Sync form when activeUnitId changes externally (e.g. clicking Edit from Inventory tab)
  useEffect(() => {
    if (activeUnitId !== null) {
      const found = records.find((r) => r.id === activeUnitId);
      if (found) {
        populateRecordFields(found);
      }
    }
  }, [activeUnitId]);

  const populateRecordFields = (record: VehicleRecord) => {
    setYear(record.year?.toString() || '');
    setMake(record.make || '');
    setModel(record.model || '');
    setPlate(record.plate || '');
    setDateBought(record.dateBought || '');
    setDateSold(record.dateSold || '');
    setCurrency((record.currency as CurrencySymbol) || '₱');
    setSellPrice(record.sell ? record.sell.toString() : '');

    if (record.partners && record.partners.length > 0) {
      const restoredPartners: PartnerWorkingState[] = record.partners.map((p) => ({
        id: p.id || 'p_' + Math.random(),
        name: p.name,
        share: p.share ?? 50,
        expenses:
          p.expenses && p.expenses.length > 0
            ? p.expenses.map((e, idx) => ({
                id: `exp_${idx}_${Math.random()}`,
                name: e.name,
                value: e.amount.toString(),
              }))
            : [{ id: 'exp_0', name: 'Vehicle Acquisition / Buy Share', value: '' }],
      }));
      setPartners(restoredPartners);
      setActivePartnerId(restoredPartners[0].id);
    }
  };

  // When user selects a vehicle from dropdown
  const handleDropdownSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'new') {
      handleResetForm();
    } else {
      const idNum = parseInt(val, 10);
      const found = records.find((r) => r.id === idNum);
      if (found) {
        onSelectUnit(found.id);
        populateRecordFields(found);
      }
    }
  };

  const handleResetForm = () => {
    onSelectUnit(null);
    setYear('');
    setMake('');
    setModel('');
    setPlate('');
    setDateBought('');
    setDateSold('');
    setSellPrice('');
    setPartners(createDefaultPartners());
    setActivePartnerId('p1');
  };

  // Calculations
  const fullTitle =
    [year, make, model].filter(Boolean).join(' ') ||
    (activeUnitId ? 'Unnamed Vehicle' : '- - - - -');
  const displayPlate = plate.trim()
    ? plate.toUpperCase()
    : activeUnitId
    ? 'NO PLATE'
    : 'NEW UNIT';
  const numericSell = parseFloat(sellPrice) || 0;

  // Compute Days
  const daysInfo = calculateDays(dateBought, dateSold);

  // Compute Total Capital & Partner Outlays
  let totalSharesPct = 0;
  let totalCapital = 0;
  const partnerSnapshots: PartnerSnapshot[] = [];

  partners.forEach((partner, idx) => {
    totalSharesPct += partner.share || 0;
    let partnerSpent = 0;
    const nonZeroExpenses: { name: string; amount: number }[] = [];

    partner.expenses.forEach((e) => {
      const val = parseFloat(e.value.toString()) || 0;
      if (val > 0) {
        partnerSpent += val;
        nonZeroExpenses.push({ name: e.name || 'Expense', amount: val });
      }
    });

    totalCapital += partnerSpent;

    partnerSnapshots.push({
      id: partner.id,
      name: partner.name.trim() || `Partner ${idx + 1}`,
      share: partner.share,
      spent: partnerSpent,
      profitPortion: 0,
      payout: 0,
      expenses: nonZeroExpenses,
    });
  });

  const netProfit = numericSell - totalCapital;
  const profitMargin = numericSell > 0 ? (netProfit / numericSell) * 100 : 0;
  const markup = totalCapital > 0 ? (netProfit / totalCapital) * 100 : 0;

  // Finalize partner payouts
  partnerSnapshots.forEach((p) => {
    const shareFraction = (p.share || 0) / 100;
    const profitPortion = netProfit * shareFraction;
    p.profitPortion = profitPortion;
    p.payout = p.spent + profitPortion;
  });

  // Partner Management Handlers
  const handleAddPartner = () => {
    const count = partners.length + 1;
    const newId = 'p_' + Date.now();
    const evenShare = parseFloat((100 / count).toFixed(1));
    const newPartner: PartnerWorkingState = {
      id: newId,
      name: '',
      share: evenShare,
      expenses: [
        { id: `exp_${Date.now()}_1`, name: 'Vehicle Acquisition / Buy Share', value: '' },
        { id: `exp_${Date.now()}_2`, name: 'Maintenance / Parts', value: '' },
      ],
    };
    setPartners([...partners, newPartner]);
    setActivePartnerId(newId);
  };

  const handleRemovePartner = (id: string) => {
    if (partners.length <= 1) {
      alert('You must have at least one partner.');
      return;
    }
    const filtered = partners.filter((p) => p.id !== id);
    setPartners(filtered);
    if (activePartnerId === id) {
      setActivePartnerId(filtered[0].id);
    }
  };

  const handleUpdatePartnerName = (id: string, name: string) => {
    setPartners(
      partners.map((p) => (p.id === id ? { ...p, name } : p))
    );
  };

  const handleUpdatePartnerShare = (id: string, shareVal: string) => {
    const val = parseFloat(shareVal) || 0;
    setPartners(partners.map((p) => (p.id === id ? { ...p, share: val } : p)));
  };

  const handleApplySplitPreset = (shares: number[]) => {
    setPartners(
      partners.map((p, idx) => ({
        ...p,
        share: shares[idx] !== undefined ? shares[idx] : 0,
      }))
    );
  };

  const handleAddExpenseRow = (partnerId: string, customName = 'Other Cost') => {
    setPartners(
      partners.map((p) => {
        if (p.id === partnerId) {
          return {
            ...p,
            expenses: [
              ...p.expenses,
              { id: 'exp_' + Date.now(), name: customName, value: '' },
            ],
          };
        }
        return p;
      })
    );
  };

  const handleUpdateExpenseName = (
    partnerId: string,
    expId: string,
    name: string
  ) => {
    setPartners(
      partners.map((p) => {
        if (p.id === partnerId) {
          return {
            ...p,
            expenses: p.expenses.map((e) => (e.id === expId ? { ...e, name } : e)),
          };
        }
        return p;
      })
    );
  };

  const handleUpdateExpenseValue = (
    partnerId: string,
    expId: string,
    value: string
  ) => {
    setPartners(
      partners.map((p) => {
        if (p.id === partnerId) {
          return {
            ...p,
            expenses: p.expenses.map((e) => (e.id === expId ? { ...e, value } : e)),
          };
        }
        return p;
      })
    );
  };

  const handleRemoveExpenseRow = (partnerId: string, expId: string) => {
    setPartners(
      partners.map((p) => {
        if (p.id === partnerId) {
          return {
            ...p,
            expenses: p.expenses.filter((e) => e.id !== expId),
          };
        }
        return p;
      })
    );
  };

  const handleSave = () => {
    const cleanPlate = normalizePlate(plate);
    if (!cleanPlate) {
      alert(
        'Please enter a Plate Number or Conduction Sticker. The plate number is required to uniquely identify and update vehicle records.'
      );
      return;
    }

    if (totalCapital === 0 && numericSell === 0) {
      alert('Please enter partner expenses or a selling price before saving.');
      return;
    }

    const titleString = [year, make, model].filter(Boolean).join(' ') || 'Unnamed Vehicle';

    const recordToSave: VehicleRecord = {
      id: activeUnitId || Date.now(),
      title: titleString,
      year: year.trim(),
      make: make.trim(),
      model: model.trim(),
      plate: plate.trim().toUpperCase(),
      dateBought,
      dateSold,
      totalDays: daysInfo.totalDays,
      dayStatus: daysInfo.status,
      currency,
      sell: numericSell,
      totalCapital,
      profit: netProfit,
      margin: profitMargin,
      partners: partnerSnapshots,
      createdAt: activeUnitId
        ? records.find((r) => r.id === activeUnitId)?.createdAt || Date.now()
        : Date.now(),
      updatedAt: Date.now(),
    };

    onSaveRecord(recordToSave, autoBackupEnabled);
  };

  const currentActivePartner =
    partners.find((p) => p.id === activePartnerId) || partners[0];

  const currentPartnerSpent =
    partnerSnapshots.find((p) => p.id === activePartnerId)?.spent || 0;

  const isSplitBalanced = Math.abs(totalSharesPct - 100) < 0.05;

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* LEFT COLUMN: Input Form & Dynamic Partner Expenses (7 cols) */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-5 bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-xl border border-slate-200/80 dark:border-slate-800">
          {/* Unit Selector Bar (Optimized for Portrait Mode) */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] sm:text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <span>Select Vehicle Unit</span>
              <span className="font-mono text-blue-600 dark:text-blue-400 normal-case">
                {records.length} {records.length === 1 ? 'Vehicle' : 'Vehicles'} Saved
              </span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={activeUnitId ?? 'new'}
                onChange={handleDropdownSelect}
                className="flex-1 min-w-0 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer truncate"
              >
                <option value="new">- - - - - (New Vehicle Deal)</option>
                {records.map((r) => (
                  <option key={r.id} value={r.id}>
                    🚗 [{r.plate || 'NO PLATE'}] {r.title}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleResetForm}
                className="shrink-0 flex items-center justify-center gap-1 px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
                title="Start a fresh car deal"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>New</span>
              </button>
            </div>
          </div>

          {/* Active Unit Header Banner */}
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 min-w-0">
              <span className="plate-badge px-2.5 py-1 rounded-md text-xs shrink-0">
                {displayPlate}
              </span>
              <span className="text-sm sm:text-lg font-black text-slate-900 dark:text-white truncate">
                {activeUnitId ? `Editing: ${fullTitle}` : fullTitle}
              </span>
            </div>

            {/* Currency Picker */}
            <div className="flex items-center gap-1.5 shrink-0">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 hidden sm:block">
                Currency:
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencySymbol)}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-extrabold rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
              >
                <option value="₱">₱ (PHP)</option>
                <option value="$">$ (USD)</option>
                <option value="€">€ (EUR)</option>
                <option value="¥">¥ (JPY)</option>
                <option value="AED">AED</option>
              </select>
            </div>
          </div>

          {/* Vehicle Metadata Fields: Year + Make side-by-side on Portrait, Model below */}
          <div className="grid grid-cols-12 gap-2.5 sm:gap-3">
            <div className="col-span-4 sm:col-span-3">
              <label className="block text-[11px] sm:text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                Year
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2021"
                className="w-full font-mono bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none font-semibold"
              />
            </div>
            <div className="col-span-8 sm:col-span-4">
              <label className="block text-[11px] sm:text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                Make
              </label>
              <input
                type="text"
                value={make}
                onChange={(e) => setMake(e.target.value)}
                placeholder="Toyota"
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none font-semibold"
              />
            </div>
            <div className="col-span-12 sm:col-span-5">
              <label className="block text-[11px] sm:text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                Model / Variant
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Fortuner 2.8 V"
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none font-semibold"
              />
            </div>
          </div>

          {/* Plate Number */}
          <div className="bg-amber-50/60 dark:bg-amber-950/20 p-3 sm:p-3.5 rounded-2xl border border-amber-200/80 dark:border-amber-900/50">
            <label className="flex items-center justify-between text-[11px] sm:text-xs font-extrabold text-amber-900 dark:text-amber-300 mb-1.5">
              <span>
                Plate Number / Conduction Sticker{' '}
                <span className="text-blue-600 dark:text-blue-400">* (Key for Updates)</span>
              </span>
            </label>
            <input
              type="text"
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase())}
              placeholder="ABC 1234"
              className="w-full font-mono font-black tracking-wider text-base sm:text-lg bg-white dark:bg-slate-900 border-2 border-amber-300 dark:border-amber-700/80 rounded-xl px-3 py-2 text-slate-900 dark:text-white uppercase focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          {/* Dates & Holding Turnover (Compact 2-col on Portrait) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
            <div className="min-w-0">
              <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1 truncate">
                Date Bought
              </label>
              <input
                type="date"
                value={dateBought}
                onChange={(e) => setDateBought(e.target.value)}
                className="w-full min-w-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono"
              />
            </div>
            <div className="min-w-0">
              <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1 truncate">
                Date Sold <span className="font-normal text-[10px] opacity-75">(Optional)</span>
              </label>
              <input
                type="date"
                value={dateSold}
                onChange={(e) => setDateSold(e.target.value)}
                className="w-full min-w-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono"
              />
            </div>
            <div className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 flex sm:flex-col justify-between sm:justify-center items-center text-center">
              <span className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Total Days
              </span>
              <span className="text-sm font-black font-mono text-blue-600 dark:text-blue-400 sm:mt-0.5">
                {daysInfo.label}
              </span>
            </div>
          </div>

          {/* Selling Price Box */}
          <div className="bg-emerald-50/70 dark:bg-emerald-950/20 p-3.5 sm:p-4 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/50">
            <label className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wide text-emerald-900 dark:text-emerald-300 mb-1.5">
              <span>Selling / Target Price *</span>
              <span className="font-mono text-xs">{currency}</span>
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="any"
              value={sellPrice}
              onChange={(e) => setSellPrice(e.target.value)}
              placeholder="0.00"
              className="w-full font-mono font-black text-xl sm:text-2xl bg-white dark:bg-slate-900 border-2 border-emerald-300 dark:border-emerald-700 rounded-xl px-3.5 py-2 text-emerald-700 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* Dynamic Partner Tabs Section */}
          <div className="space-y-3 pt-1">
            {/* Adjustable Split Banner */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                  Adjustable Profit Split
                </span>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Total Allocated:{' '}
                  <span className="font-mono font-extrabold">
                    {totalSharesPct.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Quick Split Presets (if 2 partners) */}
                {partners.length === 2 && (
                  <div className="flex items-center gap-1 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => handleApplySplitPreset([50, 50])}
                      className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                    >
                      50/50
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplySplitPreset([60, 40])}
                      className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                    >
                      60/40
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplySplitPreset([70, 30])}
                      className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                    >
                      70/30
                    </button>
                  </div>
                )}

                {/* Status Badge */}
                {isSplitBalanced ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Balanced (100%)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    <AlertCircle className="w-3.5 h-3.5" /> Adjust ({totalSharesPct > 100 ? '+' : ''}
                    {(totalSharesPct - 100).toFixed(1)}%)
                  </span>
                )}
              </div>
            </div>

            {/* Partner Tabs Bar */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1">
              {partners.map((p, idx) => {
                const isActive = p.id === activePartnerId;
                const pSpent =
                  partnerSnapshots.find((ps) => ps.id === p.id)?.spent || 0;
                const displayName = p.name.trim() || `Partner ${idx + 1}`;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setActivePartnerId(p.id)}
                    className={`flex items-center gap-1.5 sm:gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-extrabold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>👤 {displayName}</span>
                    <span
                      className={`font-mono text-[11px] px-1.5 py-0.5 rounded-md ${
                        isActive
                          ? 'bg-blue-800/80 text-amber-300'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {formatCurrency(pSpent, currency)}
                    </span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={handleAddPartner}
                className="flex items-center gap-1 py-2 px-2.5 sm:px-3 rounded-xl text-xs font-bold bg-slate-200/80 dark:bg-slate-800/80 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-dashed border-slate-400 dark:border-slate-600 cursor-pointer shrink-0 transition-colors"
                title="Add Another Partner"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Partner</span>
              </button>
            </div>

            {/* Active Partner Panel */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-3 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3.5">
              {/* Partner Config Row: Side-by-side in Portrait Mode */}
              <div className="grid grid-cols-12 gap-2.5 sm:gap-3 items-end">
                <div className="col-span-7 sm:col-span-5">
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                    Partner Name
                  </label>
                  <input
                    type="text"
                    value={currentActivePartner.name}
                    onChange={(e) =>
                      handleUpdatePartnerName(currentActivePartner.id, e.target.value)
                    }
                    placeholder="Enter partner name"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-5 sm:col-span-4">
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 truncate">
                    Profit Share (%)
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    value={currentActivePartner.share}
                    onChange={(e) =>
                      handleUpdatePartnerShare(currentActivePartner.id, e.target.value)
                    }
                    placeholder="50"
                    className="w-full font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {partners.length > 1 && (
                  <div className="col-span-12 sm:col-span-3">
                    <button
                      type="button"
                      onClick={() => handleRemovePartner(currentActivePartner.id)}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Partner</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Expense Preset Buttons (Horizontal Scrollable on Portrait) */}
              <div>
                <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                  Quick Add Common Costs
                </span>
                <div className="flex sm:flex-wrap overflow-x-auto pb-1 gap-1.5">
                  {COMMON_EXPENSE_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl}
                      type="button"
                      onClick={() => handleAddExpenseRow(currentActivePartner.id, tmpl)}
                      className="shrink-0 text-[11px] font-semibold bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      + {tmpl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Itemized Expenses List */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs font-extrabold text-slate-600 dark:text-slate-300">
                  <span className="uppercase tracking-wide text-[11px]">
                    {currentActivePartner.name.trim() || `Partner ${partners.findIndex((p) => p.id === currentActivePartner.id) + 1}`}&apos;s Spending List
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddExpenseRow(currentActivePartner.id, '')}
                    className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Expense
                  </button>
                </div>

                <div className="space-y-2">
                  {currentActivePartner.expenses.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-1.5 sm:gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs"
                    >
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          handleUpdateExpenseName(
                            currentActivePartner.id,
                            item.id!,
                            e.target.value
                          )
                        }
                        placeholder="Expense (e.g. Tires, PMS, Gas)"
                        className="flex-1 min-w-0 text-xs sm:text-sm text-slate-900 dark:text-white px-1.5 py-1 outline-none bg-transparent font-semibold"
                      />
                      <div className="w-28 sm:w-36 shrink-0 flex items-center gap-1 border-l border-slate-200 dark:border-slate-700 pl-2">
                        <span className="text-[11px] text-slate-400 font-mono shrink-0">
                          {currency}
                        </span>
                        <input
                          type="number"
                          inputMode="decimal"
                          step="any"
                          value={item.value}
                          onChange={(e) =>
                            handleUpdateExpenseValue(
                              currentActivePartner.id,
                              item.id!,
                              e.target.value
                            )
                          }
                          placeholder="0.00"
                          className="w-full min-w-0 font-mono text-xs sm:text-sm font-bold text-right text-slate-900 dark:text-white outline-none bg-transparent"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveExpenseRow(currentActivePartner.id, item.id!)
                        }
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer shrink-0"
                        title="Remove Expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Partner Subtotal */}
                <div className="flex items-center justify-between pt-2 text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  <span>{currentActivePartner.name}&apos;s Subtotal Outlay:</span>
                  <span className="font-mono text-sm text-blue-600 dark:text-blue-400">
                    {formatCurrency(currentPartnerSpent, currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Auto Backup Toggle Checkbox */}
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs gap-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoBackupEnabled}
                onChange={(e) => onToggleAutoBackup(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 cursor-pointer shrink-0"
              />
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Auto-download backup file on save
              </span>
            </label>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline">
              Automatic JSON export
            </span>
          </div>

          {/* Bottom Action Buttons (Side-by-side even in Portrait Mode) */}
          <div className="flex items-center gap-2.5 sm:gap-3 pt-1">
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 sm:px-6 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl sm:rounded-2xl shadow-lg transition-all cursor-pointer active:scale-98"
            >
              <Save className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Save / Update Record</span>
            </button>

            <button
              type="button"
              onClick={handleResetForm}
              className="shrink-0 flex items-center justify-center gap-1.5 py-3.5 px-4 sm:px-6 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-xl sm:rounded-2xl border border-slate-300/80 dark:border-slate-700 transition-all cursor-pointer active:scale-98"
            >
              <RotateCcw className="w-4 h-4 text-slate-400" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Tag, Partner Payouts, Profit & Outlay Cards (5 cols) */}
        <div className="lg:col-span-5 lg:sticky lg:top-20">
          <SummaryCard
            title={fullTitle}
            plate={displayPlate}
            currency={currency}
            sellPrice={numericSell}
            totalCapital={totalCapital}
            netProfit={netProfit}
            profitMargin={profitMargin}
            markup={markup}
            turnoverLabel={daysInfo.label}
            partnerOutlays={partnerSnapshots}
            onOpenDealSheet={() => {
              const currentRec: VehicleRecord = {
                id: activeUnitId || Date.now(),
                title: fullTitle,
                year,
                make,
                model,
                plate: displayPlate,
                dateBought,
                dateSold,
                totalDays: daysInfo.totalDays,
                dayStatus: daysInfo.status,
                currency,
                sell: numericSell,
                totalCapital,
                profit: netProfit,
                margin: profitMargin,
                partners: partnerSnapshots,
                createdAt: Date.now(),
              };
              onOpenDealSheet(currentRec);
            }}
          />
        </div>
      </div>
    </div>
  );
};
