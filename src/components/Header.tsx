import React from 'react';
import { Sun, Moon, Car, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  totalSavedUnits: number;
}

export const Header: React.FC<HeaderProps> = ({ theme, onToggleTheme, totalSavedUnits }) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900 border-b border-slate-800 text-white shadow-lg transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 ring-2 ring-amber-400/30">
            <Car className="w-6 h-6 stroke-[2.4]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
                BelBros <span className="text-amber-400">Car Trading</span>
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/15 text-amber-300 border border-amber-400/30">
                <ShieldCheck className="w-3 h-3" /> BNS Pro
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden xs:block">
              Vehicle Buy & Sell Settlement & Fleet Manager
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{totalSavedUnits} {totalSavedUnits === 1 ? 'Unit' : 'Units'} Tracked</span>
          </div>

          <button
            type="button"
            onClick={onToggleTheme}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 hover:border-slate-600 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Toggle Dark / Light Theme"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline text-slate-200">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-300" />
                <span className="hidden sm:inline text-slate-200">Dark</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
