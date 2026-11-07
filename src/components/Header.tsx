import React, { useState } from 'react';
import { Sun, Moon, Car, ShieldCheck, Smartphone, Share, PlusSquare, X } from 'lucide-react';

interface HeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  totalSavedUnits: number;
}

export const Header: React.FC<HeaderProps> = ({ theme, onToggleTheme, totalSavedUnits }) => {
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-slate-900 border-b border-slate-800 text-white shadow-lg transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-amber-500/20 ring-2 ring-amber-400/40 shrink-0 bg-slate-950">
              <img
                src={`${import.meta.env.BASE_URL}apple-touch-icon.png`}
                alt="BelBros Icon"
                className="w-full h-full object-cover"
              />
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
          <div className="flex items-center gap-2.5">
            {/* iPhone Add to Home Screen button */}
            <button
              type="button"
              onClick={() => setShowInstallGuide(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 border border-amber-400/30 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Add BelBros to iPhone Home Screen"
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Add to iPhone</span>
            </button>

            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 font-mono">
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

      {/* iPhone Add to Homescreen Modal Guide */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setShowInstallGuide(false)} />
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white z-10 space-y-4 text-center">
            {/* Close Button */}
            <button
              onClick={() => setShowInstallGuide(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* App Icon Preview */}
            <div className="flex flex-col items-center justify-center pt-2">
              <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-xl ring-4 ring-amber-400/40 mb-3 bg-slate-950">
                <img
                  src="/apple-touch-icon.png"
                  alt="BelBros iPhone App Icon"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-black text-white">BelBros Car Trading</h3>
              <p className="text-xs text-amber-400 font-bold">iPhone Home Screen Icon Ready</p>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="bg-slate-800/80 rounded-2xl p-4 text-left text-xs space-y-3 border border-slate-700/80">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  Tap the <strong className="text-white">Share</strong> button <Share className="w-3.5 h-3.5 inline mx-1 text-blue-400" /> at the bottom of Safari.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  Scroll down and tap <strong className="text-white">Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-amber-400" />.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  Tap <strong className="text-amber-300">Add</strong>. The golden BelBros car icon will appear on your iPhone screen!
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowInstallGuide(false)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-colors"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};
