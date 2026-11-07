import React, { useState } from 'react';
import { Sun, Moon, ShieldCheck, Smartphone, Share, PlusSquare, X, Pencil, Check, RotateCcw } from 'lucide-react';
import { DEFAULT_BUSINESS_NAME } from '../utils/storage';

interface HeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  totalSavedUnits: number;
  businessName: string;
  onChangeBusinessName: (newName: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  totalSavedUnits,
  businessName,
  onChangeBusinessName,
}) => {
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [draftName, setDraftName] = useState(businessName);

  const iconUrl = `${import.meta.env.BASE_URL}apple-touch-icon.png`;

  // Split business name so first word is white and remaining words are highlighted in amber
  const splitDisplayName = (name: string) => {
    const clean = (name || DEFAULT_BUSINESS_NAME).trim();
    const parts = clean.split(/\s+/);
    if (parts.length <= 1) {
      return { primary: clean, accent: '' };
    }
    return {
      primary: parts[0],
      accent: parts.slice(1).join(' '),
    };
  };

  const { primary, accent } = splitDisplayName(businessName);
  const previewSplit = splitDisplayName(draftName || DEFAULT_BUSINESS_NAME);

  const handleOpenEditModal = () => {
    setDraftName(businessName);
    setShowEditNameModal(true);
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = draftName.trim() || DEFAULT_BUSINESS_NAME;
    onChangeBusinessName(finalName);
    setShowEditNameModal(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-slate-900 border-b border-slate-800 text-white shadow-lg transition-colors">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2">
          {/* Brand */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-md shadow-amber-500/20 ring-2 ring-amber-400/40 shrink-0 bg-slate-950">
              <img
                src={iconUrl}
                alt={`${businessName} Icon`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={handleOpenEditModal}
                  className="group flex items-center gap-1.5 text-left min-w-0 cursor-pointer rounded-lg hover:bg-slate-800/80 px-1.5 py-0.5 -ml-1.5 transition-colors"
                  title="Click to change Car Trading name"
                >
                  <h1 className="text-base sm:text-2xl font-black tracking-tight text-white flex items-center gap-1 truncate">
                    <span>{primary}</span>
                    {accent && <span className="text-amber-400 truncate">{accent}</span>}
                  </h1>
                  <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-slate-800 group-hover:bg-amber-400/20 text-slate-400 group-hover:text-amber-300 border border-slate-700 group-hover:border-amber-400/40 transition-colors shrink-0">
                    <Pencil className="w-3 h-3" />
                  </span>
                </button>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/15 text-amber-300 border border-amber-400/30 shrink-0">
                  <ShieldCheck className="w-3 h-3" /> BNS Pro
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                Buy &amp; Sell Settlement &amp; Fleet Manager
              </p>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* iPhone Add to Home Screen button */}
            <button
              type="button"
              onClick={() => setShowInstallGuide(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 border border-amber-400/30 transition-all cursor-pointer shadow-xs active:scale-95"
              title={`Add ${businessName} to iPhone Home Screen`}
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
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 hover:border-slate-600 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Toggle Dark / Light Theme"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="text-[11px] sm:text-xs text-slate-200">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-300" />
                  <span className="text-[11px] sm:text-xs text-slate-200">Dark</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Edit Car Trading Name Modal */}
      {showEditNameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setShowEditNameModal(false)} />
          <form
            onSubmit={handleSaveName}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-900 dark:text-white z-10 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-500">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black">Change Car Trading Name</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Customize the business name shown in the header &amp; deal statements
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditNameModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Header Preview */}
            <div className="bg-slate-900 rounded-2xl p-3.5 border border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl overflow-hidden ring-2 ring-amber-400/40 shrink-0 bg-slate-950">
                <img src={iconUrl} alt="Preview Icon" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Live Header Preview
                </span>
                <div className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1 truncate">
                  <span>{previewSplit.primary}</span>
                  {previewSplit.accent && (
                    <span className="text-amber-400 truncate">{previewSplit.accent}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Input Field */}
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Car Trading / Dealership Name
              </label>
              <input
                type="text"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="e.g. BelBros Car Trading"
                autoFocus
                maxLength={50}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-[11px] text-slate-400">
                  First word in white, remaining words highlighted in gold.
                </span>
                <button
                  type="button"
                  onClick={() => setDraftName(DEFAULT_BUSINESS_NAME)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-3 h-3" /> Reset Default
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowEditNameModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Save Name
              </button>
            </div>
          </form>
        </div>
      )}

      {/* iPhone Add to Homescreen Modal Guide */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setShowInstallGuide(false)} />
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl text-white z-10 space-y-4 text-center">
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
                  src={iconUrl}
                  alt={`${businessName} iPhone App Icon`}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-black text-white">{businessName}</h3>
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
                  Tap <strong className="text-amber-300">Add</strong>. The golden car icon will appear on your iPhone screen!
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
