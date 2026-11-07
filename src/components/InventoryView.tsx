import React, { useState } from 'react';
import { VehicleRecord } from '../types';
import { formatCurrency } from '../utils/formatters';
import {
  Search,
  Filter,
  Download,
  Upload,
  FileSpreadsheet,
  Trash2,
  Edit3,
  Printer,
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  Car,
  AlertCircle,
} from 'lucide-react';

interface InventoryViewProps {
  records: VehicleRecord[];
  onEditRecord: (record: VehicleRecord) => void;
  onOpenDealSheet: (record: VehicleRecord) => void;
  onDeleteRecord: (id: number) => void;
  onClearAll: () => void;
  onExportBackupJSON: () => void;
  onImportBackupJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExportCSV: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  records,
  onEditRecord,
  onOpenDealSheet,
  onDeleteRecord,
  onClearAll,
  onExportBackupJSON,
  onImportBackupJSON,
  onExportCSV,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_stock' | 'sold'>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      (r.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.plate || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.make || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.model || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.year?.toString() || '').includes(searchQuery);

    if (!matchesSearch) return false;

    if (statusFilter === 'sold') return r.dayStatus === 'Sold';
    if (statusFilter === 'in_stock') return r.dayStatus === 'In Stock';
    return true;
  });

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-5">
      {/* Top Header Card & Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 shadow-xl border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Saved Vehicle Inventory & Sales Log
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                {records.length} Units
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Click any vehicle row to view the full settlement breakdown. Click the <strong className="text-blue-600 dark:text-blue-400">Printer icon</strong> to print or share, or the <strong className="text-blue-600 dark:text-blue-400">Pencil icon</strong> to edit.
            </p>
          </div>

          {/* Backup, Import, CSV, Clear Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={onExportBackupJSON}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-xs"
              title="Download full JSON backup of all vehicles and expenses"
            >
              <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Backup (JSON)</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-xs"
              title="Restore records from a saved JSON backup file"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Import / Restore</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={onImportBackupJSON}
            />

            <button
              type="button"
              onClick={onExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-xs"
              title="Export summary spreadsheet for Excel or Google Sheets"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-500" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={onClearAll}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer"
              title="Clear all saved records from browser"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by plate, make, model, year..."
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({records.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('in_stock')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                statusFilter === 'in_stock'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              In Stock ({records.filter((r) => r.dayStatus === 'In Stock').length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('sold')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                statusFilter === 'sold'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sold ({records.filter((r) => r.dayStatus === 'Sold').length})
            </button>
          </div>
        </div>

        {/* Table of Records */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/90 text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4">Vehicle Description</th>
                <th className="py-3 px-4">Plate / MV</th>
                <th className="py-3 px-4">Status & Days</th>
                <th className="py-3 px-4">Partner Payouts</th>
                <th className="py-3 px-4 text-right">Capital Outlay</th>
                <th className="py-3 px-4 text-right">Selling Price</th>
                <th className="py-3 px-4 text-right">Net Profit</th>
                <th className="py-3 px-4 text-right">Margin</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <Car className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                    <p className="font-bold text-sm">No vehicles match your criteria</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {records.length === 0
                        ? 'Fill out the form in the Vehicle tab and save your first deal.'
                        : 'Try adjusting your search query or status filter.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => {
                  const isExpanded = expandedId === r.id;
                  const isSold = r.dayStatus === 'Sold';
                  const isProfitable = r.profit >= 0;

                  return (
                    <React.Fragment key={r.id}>
                      <tr
                        onClick={() => toggleExpand(r.id)}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group ${
                          isExpanded ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                        }`}
                      >
                        {/* Vehicle Title */}
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <span>{r.title}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                            )}
                          </div>
                        </td>

                        {/* Plate */}
                        <td className="py-3.5 px-4">
                          <span className="plate-badge px-2 py-0.5 rounded text-[11px]">
                            {r.plate || 'NO PLATE'}
                          </span>
                        </td>

                        {/* Status & Days */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] ${
                                isSold
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              }`}
                            >
                              {isSold ? 'SOLD' : 'IN STOCK'}
                            </span>
                            <span className="text-slate-500 font-mono text-[11px]">
                              {r.totalDays !== null ? `${r.totalDays}d` : '—'}
                            </span>
                          </div>
                        </td>

                        {/* Partner Payouts */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5 font-mono text-[11px]">
                            {r.partners?.map((p) => (
                              <div key={p.id} className="text-slate-600 dark:text-slate-300">
                                <span className="font-medium text-slate-400">{p.name}:</span>{' '}
                                <strong className="text-blue-600 dark:text-blue-400">
                                  {formatCurrency(p.payout, r.currency)}
                                </strong>
                              </div>
                            ))}
                          </div>
                        </td>

                        {/* Capital Outlay */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                          {formatCurrency(r.totalCapital, r.currency)}
                        </td>

                        {/* Selling Price */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                          {formatCurrency(r.sell, r.currency)}
                        </td>

                        {/* Net Profit */}
                        <td
                          className={`py-3.5 px-4 text-right font-mono font-extrabold ${
                            isProfitable
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {formatCurrency(r.profit, r.currency)}
                        </td>

                        {/* Margin */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                          {(r.margin || 0).toFixed(1)}%
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => onEditRecord(r)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Edit in Calculator"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => onOpenDealSheet(r)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Print / Share Deal Sheet"
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => onDeleteRecord(r.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Breakdown Drawer */}
                      {isExpanded && (
                        <tr className="bg-slate-50/90 dark:bg-slate-800/40">
                          <td colSpan={9} className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
                            <div className="space-y-4">
                              {/* Header & Capital banner */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700 gap-2">
                                <div>
                                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                                    <span>BelBros Deal Settlement for {r.title}</span>
                                    <span className="plate-badge px-2 py-0.5 rounded text-xs">
                                      {r.plate}
                                    </span>
                                  </h4>
                                </div>
                                <div className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                                  Total Capital Outlay:{' '}
                                  <span className="text-rose-600 dark:text-rose-400 font-extrabold">
                                    {formatCurrency(r.totalCapital, r.currency)}
                                  </span>
                                </div>
                              </div>

                              {/* Partner Settlement Banner Boxes */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {r.partners?.map((p) => (
                                  <div
                                    key={p.id}
                                    className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs"
                                  >
                                    <div className="flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">
                                      <span>👤 {p.name}</span>
                                      <span className="font-mono">{(p.share || 0).toFixed(1)}%</span>
                                    </div>
                                    <div className="text-lg font-black font-mono text-blue-600 dark:text-blue-400 my-1">
                                      {formatCurrency(p.payout, r.currency)}
                                    </div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                                      Expenses ({formatCurrency(p.spent, r.currency)}) + Profit (
                                      {formatCurrency(p.profitPortion, r.currency)})
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Timeline strip */}
                              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                                <span className="flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                                  <strong>Bought:</strong> {r.dateBought || 'Not specified'}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                                  <strong>Sold:</strong> {r.dateSold || 'Still in Inventory (Active)'}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                                  <strong>Holding:</strong> {r.totalDays !== null ? `${r.totalDays} Days (${r.dayStatus})` : 'Not computed'}
                                </span>
                              </div>

                              {/* Itemized Expenses by Partner */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {r.partners?.map((p) => (
                                  <div
                                    key={p.id}
                                    className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700"
                                  >
                                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200 pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                                      <span className="text-blue-600 dark:text-blue-400">👤 {p.name}&apos;s Outlay</span>
                                      <span className="font-mono text-slate-900 dark:text-white">
                                        {formatCurrency(p.spent, r.currency)}
                                      </span>
                                    </div>

                                    <div className="space-y-1.5 font-mono text-xs">
                                      {p.expenses && p.expenses.length > 0 ? (
                                        p.expenses.map((e, idx) => (
                                          <div
                                            key={idx}
                                            className="flex items-center justify-between text-slate-600 dark:text-slate-400"
                                          >
                                            <span className="font-sans text-[11px] text-slate-700 dark:text-slate-300">
                                              {e.name}
                                            </span>
                                            <span>{formatCurrency(e.amount, r.currency)}</span>
                                          </div>
                                        ))
                                      ) : (
                                        <div className="text-slate-400 text-[11px] italic">
                                          No itemized costs recorded.
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
