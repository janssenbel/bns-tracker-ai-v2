import React, { useState, useEffect } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, CheckCircle2 } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [showReconnected, setShowReconnected] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      setShowReconnected(false);
    } else if (wasOffline && isOnline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (!isOnline) {
    return (
      <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-3 duration-300">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/95 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 border border-amber-300 backdrop-blur-md">
          <WifiOff className="w-4 h-4 shrink-0 text-slate-950 animate-pulse" />
          <span>Offline Mode — All calculations and inventory work without internet</span>
        </div>
      </div>
    );
  }

  if (showReconnected) {
    return (
      <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-3 duration-300">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600/95 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/20 border border-emerald-400 backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-amber-300" />
          <span>Connected — Back online</span>
        </div>
      </div>
    );
  }

  return null;
};
