import React, { useState } from 'react';
import { VehicleRecord } from '../types';
import { formatCurrency } from '../utils/formatters';
import {
  DollarSign,
  TrendingUp,
  Percent,
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

  const cur = (records[0] && records[0].currency) || '₱';

  let totalProfit = 0;
  let totalRevenue = 0;
  let totalCapital = 0;
  let soldCount = 0;
  let inStockCount = 0;
  let totalSoldDays = 0;

  const partnerAccumulator: Record<
    string,
    { name: string; totalSpent: number; totalProfitShare: number; totalPayout: number }
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
          };
        }
        partnerAccumulator[key].totalSpent += p.spent || 0;
        partnerAccumulator[key].totalProfitShare += p.profitPortion || 0;
        partnerAccumulator[key].totalPayout += p.payout || 0;
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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 shadow-xl border border-slate-200/80 dark:border-slate-800 space-y-6">
        {/* Title & Sheet Export Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Total Net Profit & Business Portfolio</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Cumulative financial breakdown, total returns, and partner distributions across all deals.
            </p>
          </div>

          <button
            type="button"
            onClick={onExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
            title="Export summary spreadsheet"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Export Spreadsheet</span>
          </button>
        </div>

        {/* PRIMARY FINANCIAL KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Net Profit */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border-l-4 border-l-emerald-500 border-t border-r border-b border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between">
            <div>
              <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                Total Net Profit
              </span>
              <div
                className={`text-2xl sm:text-3xl font-black font-mono mt-1 ${
                  totalProfit >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {formatCurrency(totalProfit, cur)}
              </div>
            </div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
              Overall Margin:{' '}
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">
                {overallMargin.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Total Sales Revenue */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border-l-4 border-l-blue-500 border-t border-r border-b border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between">
            <div>
              <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                Total Gross Revenue
              </span>
              <div className="text-2xl sm:text-3xl font-black font-mono text-blue-600 dark:text-blue-400 mt-1">
                {formatCurrency(totalRevenue, cur)}
              </div>
            </div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 truncate">
              Avg Sale: <span className="font-mono">{formatCurrency(avgRevenuePerCar, cur)}</span> / car
            </div>
          </div>

          {/* Total Capital Outlay */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border-l-4 border-l-rose-500 border-t border-r border-b border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between">
            <div>
              <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                Total Capital Outlay
              </span>
              <div className="text-2xl sm:text-3xl font-black font-mono text-rose-600 dark:text-rose-400 mt-1">
                {formatCurrency(totalCapital, cur)}
              </div>
            </div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
              Cost of Vehicles + Repairs
            </div>
          </div>

          {/* Avg Profit Per Vehicle */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border-l-4 border-l-amber-500 border-t border-r border-b border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between">
            <div>
              <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                Avg Profit / Vehicle
              </span>
              <div className="text-2xl sm:text-3xl font-black font-mono text-amber-600 dark:text-amber-400 mt-1">
                {formatCurrency(avgProfitPerCar, cur)}
              </div>
            </div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 font-mono">
              {totalCars} Total Vehicles in System
            </div>
          </div>
        </div>

        {/* FLEET STATUS STRIP */}
        <div className="bg-slate-100/80 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Car className="w-4 h-4 text-slate-500" />
            <span>Total Fleet:</span>
            <strong className="font-mono text-slate-900 dark:text-white font-black">{totalCars} cars</strong>
          </div>

          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>Sold Units:</span>
            <strong className="font-mono text-blue-600 dark:text-blue-400 font-black">{soldCount} cars</strong>
          </div>

          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Package className="w-4 h-4 text-amber-500" />
            <span>In Stock / Active:</span>
            <strong className="font-mono text-amber-600 dark:text-amber-400 font-black">{inStockCount} cars</strong>
          </div>

          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Clock className="w-4 h-4 text-indigo-500" />
            <span>Avg Turnover:</span>
            <strong className="font-mono text-indigo-600 dark:text-indigo-400 font-black">
              {avgTurnoverDays !== null ? `${avgTurnoverDays} days` : '—'}
            </strong>
          </div>
        </div>

        {/* CUMULATIVE PARTNER EARNINGS */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                Partner Cumulative Earnings & Return on Capital
              </h3>
            </div>
            <span className="text-xs text-slate-400">Across all car transactions</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.keys(partnerAccumulator).length > 0 ? (
              Object.keys(partnerAccumulator).map((key) => {
                const p = partnerAccumulator[key];
                return (
                  <div
                    key={p.name}
                    className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                        👤 {p.name}
                      </span>
                      <span className="text-[11px] text-slate-400 font-semibold">Cumulative Return</span>
                    </div>

                    <div className="text-xl sm:text-2xl font-black font-mono text-blue-600 dark:text-blue-400 my-1">
                      {formatCurrency(p.totalPayout, cur)}
                    </div>

                    <div className="text-xs font-mono text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1">
                      <div className="flex justify-between">
                        <span>Total Capital Invested:</span>
                        <span className="font-semibold">{formatCurrency(p.totalSpent, cur)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Profit Earned:</span>
                        <strong
                          className={
                            p.totalProfitShare >= 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }
                        >
                          {formatCurrency(p.totalProfitShare, cur)}
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-slate-400 p-4">No partner transactions recorded yet.</div>
            )}
          </div>
        </div>

        {/* VEHICLE PROFIT LEADERBOARD */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                Vehicle Profit Leaderboard
              </h3>
            </div>
            <span className="text-xs text-slate-400">Ranked by deal performance</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
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
                      {/* Rank */}
                      <td className="py-3 px-4 font-mono font-extrabold text-slate-500">
                        {index === 0 ? '🥇 #1' : index === 1 ? '🥈 #2' : index === 2 ? '🥉 #3' : `#${index + 1}`}
                      </td>

                      {/* Vehicle */}
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {r.title}
                      </td>

                      {/* Plate */}
                      <td className="py-3 px-4">
                        <span className="plate-badge px-2 py-0.5 rounded text-[11px]">
                          {r.plate || 'NO PLATE'}
                        </span>
                      </td>

                      {/* Status */}
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

                      {/* Capital Outlay */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                        {formatCurrency(r.totalCapital, r.currency)}
                      </td>

                      {/* Selling Price */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {formatCurrency(r.sell, r.currency)}
                      </td>

                      {/* Net Profit */}
                      <td
                        className={`py-3 px-4 text-right font-mono font-extrabold ${
                          isProfitable
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {formatCurrency(r.profit, r.currency)}
                      </td>

                      {/* Margin % */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                        {(r.margin || 0).toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
