import React, { useState } from 'react';
import { VehicleRecord } from '../types';
import { formatCurrency } from '../utils/formatters';
import {
  Car,
  CheckCircle2,
  Package,
  Clock,
  FileSpreadsheet,
  Award,
  Users,
  ArrowUpDown,
} from 'lucide-react';

interface TotalProfitViewProps {
  records: VehicleRecord[];
  onExportCSV: () => void;
  onOpenDealSheet: (record: VehicleRecord) => void;
}

export const TotalProfitView: React.FC<TotalProfitViewProps> = ({
  records,
  onExportCSV,
  onOpenDealSheet,
}) => {
  const [sortField, setSortField] = useState<'profit' | 'margin' | 'sell' | 'capital'>('profit');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const cur = '₱';

  let totalProfit = 0;
  let totalRevenue = 0;
  let totalCapital = 0;
  let soldCount = 0;
  let inStockCount = 0;
  let totalSoldDays = 0;

  const partnerAccumulator: Record<
    string,
    {
      name: string;
      totalSpent: number;
      totalProfitShare: number;
      totalPayout: number;
      shareSum: number;
      dealCount: number;
    }
  > = {};

  records.forEach((r) => {
    const profit = r.profit || 0;
    const sell = r.sell || 0;
    const cap = r.totalCapital || 0;

    totalProfit += profit;
    totalRevenue += sell;
    totalCapital += cap;

    if (r.dayStatus === 'Sold') {
      soldCount++;
      if (r.totalDays !== null && r.totalDays !== undefined) {
        totalSoldDays += r.totalDays;
      }
    } else {
      inStockCount++;
    }

    if (r.partners && r.partners.length > 0) {
      r.partners.forEach((p) => {
        const key = p.name ? p.name.trim() : 'Partner';
        if (!partnerAccumulator[key]) {
          partnerAccumulator[key] = {
            name: key,
            totalSpent: 0,
            totalProfitShare: 0,
            totalPayout: 0,
            shareSum: 0,
            dealCount: 0,
          };
        }
        partnerAccumulator[key].totalSpent += p.spent || 0;
        partnerAccumulator[key].totalProfitShare += p.profitPortion || 0;
        partnerAccumulator[key].totalPayout += p.payout || 0;
        partnerAccumulator[key].shareSum += p.share || 0;
        partnerAccumulator[key].dealCount += 1;
      });
    }
  });

  const totalCars = records.length;
  const overallMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  const avgProfitPerCar = totalCars > 0 ? totalProfit / totalCars : 0;
  const avgRevenuePerCar = totalCars > 0 ? totalRevenue / totalCars : 0;
  const avgTurnoverDays = soldCount > 0 ? Math.round(totalSoldDays / soldCount) : null;

  // Sorting leaderboard
  const sortedRecords = [...records].sort((a, b) => {
    let diff = 0;
    if (sortField === 'profit') diff = (b.profit || 0) - (a.profit || 0);
    else if (sortField === 'margin') diff = (b.margin || 0) - (a.margin || 0);
    else if (sortField === 'sell') diff = (b.sell || 0) - (a.sell || 0);
    else if (sortField === 'capital') diff = (b.totalCapital || 0) - (a.totalCapital || 0);
    return sortAsc ? -diff : diff;
  });

  const handleSort = (field: 'profit' | 'margin' | 'sell' | 'capital') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4 space-y-5 sm:space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-xl border border-slate-200/80 dark:border-slate-800 space-y-5 sm:space-y-6">
        {/* Title & Sheet Export Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Total Net Profit (₱) &amp; Business Summary
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Cumulative financial breakdown, total profits, and partner returns across all saved car transactions.
            </p>
          </div>

          <button
            type="button"
            onClick={onExportCSV}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-xs sm:self-auto"
            title="Export summary spreadsheet"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Export Sheet</span>
          </button>
        </div>

        {/* PRIMARY FINANCIAL KPI CARDS (2x2 Grid in Portrait Mode, 4-col on Desktop) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {/* Total Net Profit */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 sm:p-5 rounded-2xl border-l-4 border-l-emerald-500 border-t border-r border-b border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between min-w-0">
            <div>
              <span className="text-[10px] sm:text-xs font-extrabold uppercase text-slate-400 tracking-wider block truncate">
                Total Net Profit (₱)
              </span>
              <div
                className={`text-base sm:text-2xl lg:text-3xl font-black font-mono mt-1 truncate ${
                  totalProfit >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {formatCurrency(totalProfit, cur)}
              </div>
            </div>
            <div className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 truncate">
              Margin:{' '}
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">
                {overallMargin.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Total Sales Revenue */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 sm:p-5 rounded-2xl border-l-4 border-l-blue-500 border-t border-r border-b border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between min-w-0">
            <div>
              <span className="text-[10px] sm:text-xs font-extrabold uppercase text-slate-400 tracking-wider block truncate">
                Total Sales (Revenue)
              </span>
              <div className="text-base sm:text-2xl lg:text-3xl font-black font-mono text-blue-600 dark:text-blue-400 mt-1 truncate">
                {formatCurrency(totalRevenue, cur)}
              </div>
            </div>
            <div className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 truncate">
              Avg: <span className="font-mono">{formatCurrency(avgRevenuePerCar, cur)}</span>
            </div>
          </div>

          {/* Total Capital Outlay */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 sm:p-5 rounded-2xl border-l-4 border-l-rose-500 border-t border-r border-b border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between min-w-0">
            <div>
              <span className="text-[10px] sm:text-xs font-extrabold uppercase text-slate-400 tracking-wider block truncate">
                Total Capital Outlay
              </span>
              <div className="text-base sm:text-2xl lg:text-3xl font-black font-mono text-rose-600 dark:text-rose-400 mt-1 truncate">
                {formatCurrency(totalCapital, cur)}
              </div>
            </div>
            <div className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 truncate">
              Vehicles + Repairs
            </div>
          </div>

          {/* Avg Profit Per Vehicle */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 sm:p-5 rounded-2xl border-l-4 border-l-amber-500 border-t border-r border-b border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between min-w-0">
            <div>
              <span className="text-[10px] sm:text-xs font-extrabold uppercase text-slate-400 tracking-wider block truncate">
                Avg Profit / Vehicle
              </span>
              <div className="text-base sm:text-2xl lg:text-3xl font-black font-mono text-amber-600 dark:text-amber-400 mt-1 truncate">
                {formatCurrency(avgProfitPerCar, cur)}
              </div>
            </div>
            <div className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 font-mono truncate">
              {totalCars} Total {totalCars === 1 ? 'Vehicle' : 'Vehicles'}
            </div>
          </div>
        </div>

        {/* FLEET STATUS STRIP (2x2 Grid in Portrait Mode) */}
        <div className="bg-slate-100/80 dark:bg-slate-800/60 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-between gap-2.5 sm:gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 sm:gap-2 text-slate-700 dark:text-slate-300">
            <Car className="w-4 h-4 text-slate-500 shrink-0" />
            <span>Total Fleet:</span>
            <strong className="font-mono text-slate-900 dark:text-white font-black">{totalCars}</strong>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 text-slate-700 dark:text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Sold Units:</span>
            <strong className="font-mono text-blue-600 dark:text-blue-400 font-black">{soldCount}</strong>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 text-slate-700 dark:text-slate-300">
            <Package className="w-4 h-4 text-amber-500 shrink-0" />
            <span>In Stock:</span>
            <strong className="font-mono text-amber-600 dark:text-amber-400 font-black">{inStockCount}</strong>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 text-slate-700 dark:text-slate-300">
            <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>Avg Turnover:</span>
            <strong className="font-mono text-indigo-600 dark:text-indigo-400 font-black">
              {avgTurnoverDays !== null ? `${avgTurnoverDays}d` : '—'}
            </strong>
          </div>
        </div>

        {/* CUMULATIVE PARTNER EARNINGS */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <h3 className="text-xs sm:text-base font-extrabold text-slate-900 dark:text-white truncate">
                Partner Total Earnings &amp; Return on Capital
              </h3>
            </div>
            <span className="text-[11px] sm:text-xs text-slate-400 shrink-0 hidden xs:inline">
              Across all deals
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {Object.keys(partnerAccumulator).length > 0 ? (
              Object.keys(partnerAccumulator).map((key) => {
                const p = partnerAccumulator[key];
                const isPartnerProfit = p.totalProfitShare >= 0;
                const profitSharePct =
                  totalProfit !== 0
                    ? (p.totalProfitShare / totalProfit) * 100
                    : p.dealCount > 0
                    ? p.shareSum / p.dealCount
                    : 0;
                const returnOnCapitalPct =
                  p.totalSpent > 0 ? (p.totalProfitShare / p.totalSpent) * 100 : 0;

                return (
                  <div
                    key={p.name}
                    className="bg-slate-50 dark:bg-slate-800/50 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-2.5 shadow-xs"
                  >
                    {/* Partner Header & % of Profit Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-extrabold text-xs sm:text-sm text-blue-600 dark:text-blue-400 uppercase flex items-center gap-1.5 truncate">
                        👤 {p.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/70 shrink-0">
                        {profitSharePct.toFixed(1)}% of Profit
                      </span>
                    </div>

                    {/* Emphasized Total Profit Earned Hero Box */}
                    <div
                      className={`p-3 rounded-xl border ${
                        isPartnerProfit
                          ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-800/60'
                          : 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200/80 dark:border-rose-800/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Total Profit Earned
                        </span>
                        <span
                          className={`text-[11px] font-mono font-extrabold ${
                            isPartnerProfit
                              ? 'text-emerald-700 dark:text-emerald-300'
                              : 'text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {returnOnCapitalPct >= 0 ? '+' : ''}
                          {returnOnCapitalPct.toFixed(1)}% ROI
                        </span>
                      </div>
                      <div
                        className={`text-xl sm:text-2xl font-black font-mono tracking-tight truncate ${
                          isPartnerProfit
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {formatCurrency(p.totalProfitShare, cur)}
                      </div>
                    </div>

                    {/* Secondary Breakdown: Capital Invested & Cumulative Return */}
                    <div className="text-[11px] sm:text-xs font-mono text-slate-500 dark:text-slate-400 pt-1.5 border-t border-slate-200 dark:border-slate-700 space-y-1">
                      <div className="flex justify-between gap-2">
                        <span>Total Capital Invested:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {formatCurrency(p.totalSpent, cur)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span>Total Cumulative Return:</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          {formatCurrency(p.totalPayout, cur)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-xs text-slate-400 py-6 px-4 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                No partner transactions recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* VEHICLE PROFIT LEADERBOARD */}
        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500 shrink-0" />
              <h3 className="text-xs sm:text-base font-extrabold text-slate-900 dark:text-white">
                Vehicle Profit Leaderboard
              </h3>
            </div>
            <span className="text-[11px] sm:text-xs text-slate-400">Unit-by-unit results</span>
          </div>

          {sortedRecords.length === 0 ? (
            <div className="py-10 px-4 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-400">
              No vehicle records found. Save vehicle deals to see cumulative profit summary.
            </div>
          ) : (
            <>
              {/* PORTRAIT MODE LEADERBOARD CARDS (< md) */}
              <div className="md:hidden space-y-2.5">
                {sortedRecords.map((r, index) => {
                  const isSold = r.dayStatus === 'Sold';
                  const isProfitable = (r.profit || 0) >= 0;
                  const rankBadge =
                    index === 0 ? '🥇 #1' : index === 1 ? '🥈 #2' : index === 2 ? '🥉 #3' : `#${index + 1}`;

                  return (
                    <div
                      key={r.id}
                      onClick={() => onOpenDealSheet(r)}
                      className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 active:bg-slate-100 dark:active:bg-slate-800 transition-colors cursor-pointer space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono font-extrabold text-xs text-slate-500 shrink-0">
                            {rankBadge}
                          </span>
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                            {r.title}
                          </span>
                        </div>
                        <span className="plate-badge px-2 py-0.5 rounded text-[11px] shrink-0">
                          {r.plate || 'NO PLATE'}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800 text-[11px]">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">
                            Capital
                          </span>
                          <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                            {formatCurrency(r.totalCapital, r.currency)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">
                            Sell Price
                          </span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            {formatCurrency(r.sell, r.currency)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">
                            Profit ({(r.margin || 0).toFixed(1)}%)
                          </span>
                          <span
                            className={`font-mono font-black ${
                              isProfitable
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {formatCurrency(r.profit, r.currency)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* DESKTOP LEADERBOARD TABLE (md and up) */}
              <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/90 text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800">
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">Vehicle</th>
                      <th className="py-3 px-4">Plate</th>
                      <th className="py-3 px-4">Status</th>
                      <th
                        className="py-3 px-4 text-right cursor-pointer hover:text-blue-600"
                        onClick={() => handleSort('capital')}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <span>Capital Outlay</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th
                        className="py-3 px-4 text-right cursor-pointer hover:text-blue-600"
                        onClick={() => handleSort('sell')}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <span>Selling Price</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th
                        className="py-3 px-4 text-right cursor-pointer hover:text-blue-600"
                        onClick={() => handleSort('profit')}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <span>Net Profit</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th
                        className="py-3 px-4 text-right cursor-pointer hover:text-blue-600"
                        onClick={() => handleSort('margin')}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <span>Margin %</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {sortedRecords.map((r, index) => {
                      const isSold = r.dayStatus === 'Sold';
                      const isProfitable = (r.profit || 0) >= 0;

                      return (
                        <tr
                          key={r.id}
                          onClick={() => onOpenDealSheet(r)}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                          title="Click to view deal statement"
                        >
                          <td className="py-3 px-4 font-mono font-extrabold text-slate-500">
                            {index === 0
                              ? '🥇 #1'
                              : index === 1
                              ? '🥈 #2'
                              : index === 2
                              ? '🥉 #3'
                              : `#${index + 1}`}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                            {r.title}
                          </td>
                          <td className="py-3 px-4">
                            <span className="plate-badge px-2 py-0.5 rounded text-[11px]">
                              {r.plate || 'NO PLATE'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] ${
                                isSold
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              }`}
                            >
                              {isSold ? 'SOLD' : 'IN STOCK'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                            {formatCurrency(r.totalCapital, r.currency)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                            {formatCurrency(r.sell, r.currency)}
                          </td>
                          <td
                            className={`py-3 px-4 text-right font-mono font-extrabold ${
                              isProfitable
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {formatCurrency(r.profit, r.currency)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                            {(r.margin || 0).toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
