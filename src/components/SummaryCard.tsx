import React from 'react';
import { CurrencySymbol, PartnerSnapshot } from '../types';
import { formatCurrency } from '../utils/formatters';
import { Printer, TrendingUp, Percent, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  plate: string;
  currency: CurrencySymbol | string;
  sellPrice: number;
  totalCapital: number;
  netProfit: number;
  profitMargin: number;
  markup: number;
  turnoverLabel: string;
  partnerOutlays: PartnerSnapshot[];
  onOpenDealSheet: () => void;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  plate,
  currency,
  sellPrice,
  totalCapital,
  netProfit,
  profitMargin,
  markup,
  turnoverLabel,
  partnerOutlays,
  onOpenDealSheet,
}) => {
  const isPending = sellPrice === 0 && totalCapital === 0;
  const isProfit = netProfit > 0;
  const isLoss = netProfit < 0;

  return (
    <div className="space-y-4">
      {/* 1. Live Vehicle Tag Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-800">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
          <span className="uppercase tracking-wider">Live Vehicle Preview</span>
          <span className="plate-badge px-2.5 py-0.5 rounded text-xs">
            {plate || 'NEW UNIT'}
          </span>
        </div>
        <h2 className="text-lg sm:text-xl font-extrabold text-white truncate tracking-tight">
          {title || '- - - - -'}
        </h2>
      </div>

      {/* 2. Partner Payouts Summary Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-md border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              Partner Payouts (Take-Home)
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Capital Reimbursed + Profit Share
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenDealSheet}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-all cursor-pointer shadow-xs active:scale-95"
            title="Open Deal Settlement Statement to Print or Export PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>

        {/* Dynamic Partner Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {partnerOutlays.map((p) => {
            const isPartnerProfit = p.profitPortion >= 0;
            return (
              <div
                key={p.id}
                className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    👤 {p.name}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
                    {p.share.toFixed(1)}% Share
                  </span>
                </div>

                <div className="my-1.5">
                  <div className="text-lg sm:text-xl font-black font-mono text-blue-600 dark:text-blue-400 tracking-tight">
                    {formatCurrency(p.payout, currency)}
                  </div>
                </div>

                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60 space-y-0.5">
                  <div className="flex justify-between">
                    <span>Expenses Outlay:</span>
                    <span className="font-semibold">{formatCurrency(p.spent, currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Profit ({p.share.toFixed(1)}%):</span>
                    <span
                      className={`font-bold ${
                        isPartnerProfit
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {formatCurrency(p.profitPortion, currency)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          ⚖️ Each partner recovers 100% of their spent capital plus their agreed profit share %.
        </p>
      </div>

      {/* 3. Net Deal Profit Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-md border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Net Deal Profit
          </span>

          {isPending ? (
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              Pending
            </span>
          ) : isProfit ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <CheckCircle2 className="w-3 h-3" /> Profitable Deal
            </span>
          ) : isLoss ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
              <AlertTriangle className="w-3 h-3" /> Net Loss
            </span>
          ) : (
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              Break-even
            </span>
          )}
        </div>

        <div
          className={`text-2xl sm:text-3xl font-black font-mono tracking-tight mb-4 ${
            isPending
              ? 'text-slate-800 dark:text-slate-200'
              : isProfit
              ? 'text-emerald-600 dark:text-emerald-400'
              : isLoss
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-amber-600 dark:text-amber-400'
          }`}
        >
          {formatCurrency(netProfit, currency)}
        </div>

        {/* 3 Stats Pills */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 text-center">
            <span className="block text-[10px] font-extrabold uppercase text-slate-400 mb-0.5 flex items-center justify-center gap-1">
              <Percent className="w-2.5 h-2.5" /> Margin
            </span>
            <span className="text-sm font-black font-mono text-slate-800 dark:text-slate-200">
              {profitMargin.toFixed(1)}%
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 text-center">
            <span className="block text-[10px] font-extrabold uppercase text-slate-400 mb-0.5 flex items-center justify-center gap-1">
              <TrendingUp className="w-2.5 h-2.5" /> ROI / Markup
            </span>
            <span className="text-sm font-black font-mono text-slate-800 dark:text-slate-200">
              {markup.toFixed(1)}%
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 text-center">
            <span className="block text-[10px] font-extrabold uppercase text-slate-400 mb-0.5 flex items-center justify-center gap-1">
              <Clock className="w-2.5 h-2.5" /> Turnover
            </span>
            <span className="text-sm font-black font-mono text-blue-600 dark:text-blue-400 truncate">
              {turnoverLabel || '—'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Live Capital Outlay Breakdown Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-md border border-slate-200 dark:border-slate-800">
        <div className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wide pb-2.5 mb-3 border-b border-slate-100 dark:border-slate-800">
          Live Capital Outlays
        </div>

        <div className="space-y-2 mb-3">
          {partnerOutlays.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300"
            >
              <span>{p.name}&apos;s Capital (Spent):</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {formatCurrency(p.spent, currency)}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-sm font-extrabold">
          <span className="text-slate-800 dark:text-slate-200">Total Capital Outlay:</span>
          <span className="font-mono text-rose-600 dark:text-rose-400 font-black">
            {formatCurrency(totalCapital, currency)}
          </span>
        </div>
      </div>
    </div>
  );
};
