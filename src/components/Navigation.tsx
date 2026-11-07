import React from 'react';
import { MainViewTab } from '../types';
import { Car, BookOpen, DollarSign } from 'lucide-react';

interface NavigationProps {
  activeTab: MainViewTab;
  onSelectTab: (tab: MainViewTab) => void;
  inventoryCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  inventoryCount,
}) => {
  const tabs = [
    {
      id: 'calculator' as MainViewTab,
      label: 'Vehicle',
      subtitle: 'Calculator & Edit',
      icon: Car,
      badge: null,
    },
    {
      id: 'inventory' as MainViewTab,
      label: 'Inventory',
      subtitle: 'Saved Sales Log',
      icon: BookOpen,
      badge: inventoryCount,
    },
    {
      id: 'summary' as MainViewTab,
      label: 'Total Profit',
      subtitle: 'Portfolio Overview',
      icon: DollarSign,
      badge: null,
    },
  ];

  return (
    <nav className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-2">
      <div className="bg-slate-200/80 dark:bg-slate-800/80 backdrop-blur-md p-1.5 rounded-2xl flex items-center gap-1.5 border border-slate-300/60 dark:border-slate-700/60 shadow-inner">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 px-3 rounded-xl font-bold text-sm transition-all cursor-pointer relative ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-extrabold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-slate-700/50'
              }`}
            >
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-amber-300' : 'text-slate-500 dark:text-slate-400'}`} />
              <span className="tracking-tight">{tab.label}</span>
              {tab.badge !== null && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold transition-colors ${
                    isActive
                      ? 'bg-white text-blue-700'
                      : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
